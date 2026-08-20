import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";
import { generateSecurePlaybackUrl } from "../../services/videoStorage.service.js";

// 1. جلب الحلقة القادمة (للوحة التحكم)
export const getUpcomingSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const upcomingSession = await prisma.liveSession.findFirst({
      where: {
        scheduledAt: { gte: new Date() },
        status: "SCHEDULED"
      },
      orderBy: { scheduledAt: "asc" },
      include: { notes: true }
    });

    res.status(200).json(upcomingSession);
  } catch (error) {
    next(error);
  }
};

// 2. جلب جميع الحلقات المتاحة للطالبة
export const getStudentSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    const sessions = await prisma.liveSession.findMany({
      orderBy: { scheduledAt: "desc" },
      include: {
        notes: true,
        attendance: {
          where: { userId },
          select: { status: true, createdAt: true }
        }
      }
    });

    res.status(200).json(sessions);
  } catch (error) {
    next(error);
  }
};

// 3. جلب التسجيلات المتاحة للطالبة مع ربط حالة الحضور والغياب ومهلة الـ 7 أيام
export const getStudentRecordings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // جلب كل التسجيلات المنشورة غير المنتهية
    const recordings = await prisma.recording.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      },
      include: {
        session: {
          select: {
            id: true,
            title: true,
            scheduledAt: true,
            durationMinutes: true,
          }
        },
        allowedUsers: { where: { userId } }
      },
      orderBy: { createdAt: "desc" }
    });

    // جلب سجلات حضور وغياب الطالبة
    const studentAttendance = await prisma.attendance.findMany({
      where: { userId },
      select: { sessionId: true, status: true }
    });
    const attendanceMap = new Map(studentAttendance.map((a) => [a.sessionId, a.status]));

    // تصفية التسجيلات وإثرائها ببيانات التعويض والمهلة
    const accessibleRecordings: any[] = [];

    for (const recording of recordings) {
      const attendanceStatus = attendanceMap.get(recording.sessionId) || "UNRECORDED";
      const isAbsent = attendanceStatus === "ABSENT";
      const isPresent = attendanceStatus === "PRESENT";

      let hasAccess = false;
      if (recording.accessMode === "ALL_ACTIVE_STUDENTS") {
        hasAccess = true;
      } else if (recording.accessMode === "ATTENDEES_ONLY" && isPresent) {
        hasAccess = true;
      } else if (recording.accessMode === "SELECTED_STUDENTS" && recording.allowedUsers.length > 0) {
        hasAccess = true;
      }

      if (hasAccess) {
        // حساب الوقت المتبقي بالأيام والساعات
        const expiresAtTime = recording.expiresAt ? new Date(recording.expiresAt).getTime() : null;
        const diffMs = expiresAtTime ? Math.max(0, expiresAtTime - now.getTime()) : null;
        const daysLeft = diffMs !== null ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) : null;
        const hoursLeft = diffMs !== null ? Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) : null;

        accessibleRecordings.push({
          ...recording,
          attendanceStatus,
          isCompensation: isAbsent,
          isCustomSelected: recording.accessMode === "SELECTED_STUDENTS",
          isExpiringSoon: daysLeft !== null && daysLeft <= 2,
          remaining: {
            totalMs: diffMs,
            days: daysLeft,
            hours: hoursLeft
          }
        });
      }
    }

    res.status(200).json(accessibleRecordings);
  } catch (error) {
    next(error);
  }
};

// 4. جلب سجل حضور وغياب الطالبة
export const getStudentAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    const attendanceHistory = await prisma.attendance.findMany({
      where: { userId },
      include: {
        session: {
          select: {
            id: true,
            title: true,
            scheduledAt: true,
            durationMinutes: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json(attendanceHistory);
  } catch (error) {
    next(error);
  }
};

// 5. خوارزمية التحقق الأمنية الصارمة لتشغيل الفيديو مع بيانات العلامة المائية
export const getPlaybackUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const userId = req.user.id;

    // هل التسجيل موجود؟
    const recording = await prisma.recording.findUnique({
      where: { id },
      include: {
        session: { select: { title: true } }
      }
    });

    if (!recording) {
      return res.status(404).json({ message: "التسجيل غير موجود" });
    }

    const isAdmin = req.user.role === "ADMIN";

    // هل التسجيل منشور؟ (للطالبات فقط، أما المعلمة فيمكنها المعاينة دائماً)
    if (!isAdmin && recording.status !== "PUBLISHED") {
      return res
        .status(403)
        .json({ message: "هذا التسجيل غير متاح للمشاهدة بعد" });
    }

    // هل انتهت صلاحية التسجيل؟
    const now = new Date();
    if (!isAdmin && recording.expiresAt && now > recording.expiresAt) {
      await prisma.recording.update({
        where: { id },
        data: { status: "EXPIRED" }
      });
      return res
        .status(410)
        .json({ message: "انتهت فترة الـ ٧ أيام المتاحة لمشاهدة هذا التسجيل." });
    }

    // هل تملك الطالبة صلاحية المشاهدة؟ (المعلمة تملك صلاحية دائمة)
    let hasAccess = isAdmin;

    // جلب حالة الحضور
    const attendance = await prisma.attendance.findUnique({
      where: {
        sessionId_userId: { sessionId: recording.sessionId, userId }
      }
    });

    if (!isAdmin) {
      switch (recording.accessMode) {
        case "ALL_ACTIVE_STUDENTS":
          hasAccess = true;
          break;

        case "ATTENDEES_ONLY":
          if (attendance && attendance.status === "PRESENT") {
            hasAccess = true;
          }
          break;

        case "SELECTED_STUDENTS":
          const access = await prisma.recordingAccess.findUnique({
            where: { recordingId_userId: { recordingId: id, userId } }
          });
          if (access) {
            hasAccess = true;
          }
          break;
      }
    }

    if (!hasAccess) {
      return res
        .status(403)
        .json({
          message:
            "غير مصرح لكِ بمشاهدة هذا التسجيل، التسجيل مخصص للحاضرات أو طالبات محددات."
        });
    }

    // توليد رابط التشغيل المؤقت ومعالجة نوع الفيديو
    const playback = await generateSecurePlaybackUrl(recording.storageKey);

    // حساب تفاصيل الوقت المتبقي
    const expiresAtTime = recording.expiresAt ? new Date(recording.expiresAt).getTime() : null;
    const diffMs = expiresAtTime ? Math.max(0, expiresAtTime - now.getTime()) : null;
    const daysLeft = diffMs !== null ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) : null;
    const hoursLeft = diffMs !== null ? Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) : null;

    res.status(200).json({
      playbackUrl: playback.embedUrl || playback.url,
      rawUrl: playback.url,
      videoType: playback.type,
      title: recording.title,
      sessionTitle: (recording as any).session?.title,
      expiresAt: recording.expiresAt,
      isCompensation: attendance?.status === "ABSENT",
      remaining: {
        totalMs: diffMs,
        days: daysLeft,
        hours: hoursLeft
      },
      watermark: {
        studentName: req.user.name,
        studentEmail: req.user.email,
        studentId: req.user.id,
        sessionTimestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

