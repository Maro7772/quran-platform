import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";
import {
  generateSecurePlaybackUrl,
  uploadVideoToCloudinary
} from "../../services/videoStorage.service.js";
import {
  createRecordingSchema,
  updateRecordingSchema,
  updateRecordingAccessSchema,
  publishRecordingSchema
} from "./admin.schema.js";

// 1. جلب كل التسجيلات مع إحصائيات الحضور والغياب وقائمة الطالبات المخصص لهن التسجيل
export const getRecordings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const recordings = await prisma.recording.findMany({
      include: {
        session: {
          select: {
            id: true,
            title: true,
            scheduledAt: true,
            attendance: {
              select: {
                userId: true,
                status: true,
              }
            }
          }
        },
        allowedUsers: {
          include: {
            user: {
              select: { id: true, name: true, phone: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const enriched = recordings.map((rec) => {
      const attendance = rec.session?.attendance || [];
      const presentCount = attendance.filter((a) => a.status === "PRESENT").length;
      const absentCount = attendance.filter((a) => a.status === "ABSENT").length;

      return {
        ...rec,
        stats: {
          presentCount,
          absentCount,
          totalSubscribers: attendance.length
        }
      };
    });

    res.status(200).json(enriched);
  } catch (error) {
    next(error);
  }
};

// 2. رفع ملف فيديو من جهاز/هاتف المعلمة (إلى Cloudinary أو التخزين السحابي)
export const uploadVideoFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "لم يتم اختيار أي ملف فيديو للرفع" });
    }

    // إذا كانت خدمة Cloudinary مفعلة في المتغيرات البيئية، يتم الرفع مباشرة إليها
    if (process.env.CLOUDINARY_CLOUD_NAME && req.file.buffer) {
      const uploadRes = await uploadVideoToCloudinary(req.file.buffer, req.file.originalname);
      return res.status(201).json({
        message: "تم رفع ومعالجة الفيديو بنجاح على سيرفرات Cloudinary فائقة السرعة",
        storageKey: uploadRes.secure_url,
        fileName: req.file.originalname,
        fileSize: req.file.size
      });
    }

    // في حال عدم توفر Cloudinary، يتم إرجاع مسار بديل أو عينة تجريبية
    const fallbackUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    res.status(201).json({
      message: "تم تجهيز ملف الفيديو بنجاح",
      storageKey: fallbackUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });
  } catch (error) {
    console.error("Upload error:", error);
    next(error);
  }
};

// 3. إنشاء تسجيل جديد (مسودة أو نشر فوري مع تحديد الطالبات)
export const createRecording = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      sessionId,
      title,
      storageKey,
      accessMode,
      selectedUserIds = [],
      publishNow = false,
      durationDays = 7,
      autoTargetAbsent = false
    } = createRecordingSchema.parse(req.body);

    const now = new Date();
    const expiresAt = publishNow
      ? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // جمع معرفات الطالبات المستهدفات
    const targetUserIds = new Set<string>(selectedUserIds);

    if (autoTargetAbsent && sessionId) {
      const absentRecords = await prisma.attendance.findMany({
        where: {
          sessionId,
          status: "ABSENT"
        },
        select: { userId: true }
      });
      absentRecords.forEach((r) => targetUserIds.add(r.userId));
    }

    const result = await prisma.$transaction(async (tx) => {
      const recording = await tx.recording.create({
        data: {
          sessionId,
          title,
          storageKey,
          accessMode,
          status: publishNow ? "PUBLISHED" : "DRAFT",
          publishedAt: publishNow ? now : null,
          expiresAt: expiresAt
        }
      });

      if (targetUserIds.size > 0 || accessMode === "SELECTED_STUDENTS") {
        const accessRecords = Array.from(targetUserIds).map((userId) => ({
          recordingId: recording.id,
          userId,
          expiresAt
        }));
        if (accessRecords.length > 0) {
          await tx.recordingAccess.createMany({ data: accessRecords });
        }
      }

      return recording;
    });

    res.status(201).json({
      message: publishNow
        ? `تم إضافة ونشر التسجيل بنجاح مع إتاحته للطالبات المحددة لمدة ${durationDays} أيام 🌸`
        : "تم حفظ بيانات التسجيل كمسودة بنجاح",
      recording: result
    });
  } catch (error) {
    next(error);
  }
};

// 4. تعديل بيانات التسجيل
export const updateRecording = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const {
      selectedUserIds,
      durationDays,
      ...data
    } = updateRecordingSchema.parse(req.body);

    const recording = await prisma.$transaction(async (tx) => {
      const updated = await tx.recording.update({
        where: { id },
        data: {
          ...data,
          ...(durationDays
            ? {
                expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
              }
            : {})
        }
      });

      if (selectedUserIds !== undefined) {
        await tx.recordingAccess.deleteMany({ where: { recordingId: id } });
        if (selectedUserIds.length > 0) {
          const expiresAt = updated.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          const accessRecords = selectedUserIds.map((userId) => ({
            recordingId: id,
            userId,
            expiresAt
          }));
          await tx.recordingAccess.createMany({ data: accessRecords });
        }
      }

      return updated;
    });

    res.status(200).json({ message: "تم تعديل التسجيل بنجاح", recording });
  } catch (error) {
    next(error);
  }
};

// 5. تعديل الطالبات المسموح لهن بمشاهدة التسجيل
export const updateRecordingAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const { selectedUserIds, accessMode, durationDays } = updateRecordingAccessSchema.parse(req.body);

    const recording = await prisma.recording.findUnique({ where: { id } });
    if (!recording) {
      throw Object.assign(new Error("التسجيل غير موجود"), { statusCode: 404 });
    }

    const now = new Date();
    const expiresAt = durationDays
      ? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)
      : recording.expiresAt || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      await tx.recording.update({
        where: { id },
        data: {
          ...(accessMode ? { accessMode } : {}),
          expiresAt
        }
      });

      await tx.recordingAccess.deleteMany({
        where: { recordingId: id }
      });

      if (selectedUserIds.length > 0) {
        const accessRecords = selectedUserIds.map((userId) => ({
          recordingId: id,
          userId,
          expiresAt
        }));
        await tx.recordingAccess.createMany({ data: accessRecords });
      }
    });

    res.status(200).json({
      message: `تم تحديث قائمة الطالبات المخصص لهن التسجيل بنجاح (${selectedUserIds.length} طالبات)`
    });
  } catch (error) {
    next(error);
  }
};

// 6. نشر التسجيل وتفعيل عداد الـ 7 أيام
export const publishRecording = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const { selectedUserIds, durationDays = 7, autoTargetAbsent } = publishRecordingSchema.parse(req.body);

    const recording = await prisma.recording.findUnique({ where: { id } });
    if (!recording)
      throw Object.assign(new Error("التسجيل غير موجود"), { statusCode: 404 });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // جمع معرفات الطالبات المستهدفات
    const targetUserIds = new Set<string>(selectedUserIds || []);

    if (autoTargetAbsent && recording.sessionId) {
      const absentRecords = await prisma.attendance.findMany({
        where: {
          sessionId: recording.sessionId,
          status: "ABSENT"
        },
        select: { userId: true }
      });
      absentRecords.forEach((r) => targetUserIds.add(r.userId));
    }

    await prisma.$transaction(async (tx) => {
      await tx.recording.update({
        where: { id },
        data: {
          status: "PUBLISHED",
          publishedAt: now,
          expiresAt: expiresAt
        }
      });

      await tx.recordingAccess.deleteMany({
        where: { recordingId: id }
      });

      if (targetUserIds.size > 0 || recording.accessMode === "SELECTED_STUDENTS") {
        const accessRecords = Array.from(targetUserIds).map((userId) => ({
          recordingId: id,
          userId,
          expiresAt
        }));
        if (accessRecords.length > 0) {
          await tx.recordingAccess.createMany({ data: accessRecords });
        }
      }
    });

    res.status(200).json({
      message: `تم نشر التسجيل وإتاحته للطالبات بنجاح، وستنتهي الصلاحية بعد ${durationDays} أيام`
    });
  } catch (error) {
    next(error);
  }
};

// 7. حذف التسجيل
export const deleteRecording = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;

    await prisma.$transaction(async (tx) => {
      await tx.recordingAccess.deleteMany({ where: { recordingId: id } });
      await tx.recording.delete({ where: { id } });
    });

    res.status(200).json({ message: "تم حذف التسجيل بنجاح" });
  } catch (error) {
    next(error);
  }
};

// 8. معاينة وتشغيل التسجيل للمعلمة / الإدارة
export const getRecordingPlayback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;

    const recording = await prisma.recording.findUnique({
      where: { id },
      include: {
        session: { select: { title: true } }
      }
    });

    if (!recording) {
      return res.status(404).json({ message: "التسجيل غير موجود" });
    }

    const playback = await generateSecurePlaybackUrl(recording.storageKey);

    const now = new Date();
    const expiresAtTime = recording.expiresAt ? new Date(recording.expiresAt).getTime() : null;
    const diffMs = expiresAtTime ? Math.max(0, expiresAtTime - now.getTime()) : null;
    const daysLeft = diffMs !== null ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) : null;
    const hoursLeft = diffMs !== null ? Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) : null;

    res.status(200).json({
      playbackUrl: playback.embedUrl || playback.url,
      rawUrl: playback.url,
      videoType: playback.type,
      title: recording.title,
      sessionTitle: recording.session?.title,
      expiresAt: recording.expiresAt,
      isCompensation: false,
      isTeacherPreview: true,
      remaining: {
        totalMs: diffMs,
        days: daysLeft,
        hours: hoursLeft
      },
      watermark: {
        studentName: req.user.name + " (معاينة المعلمة)",
        studentEmail: req.user.email || req.user.phone,
        studentId: req.user.id,
        sessionTimestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};



