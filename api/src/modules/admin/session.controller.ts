import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";
import {
  createSessionSchema,
  updateSessionSchema,
  updateAttendanceSchema
} from "./admin.schema.js";

// 1. جلب كل الحلقات للمعلمة
export const getSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessions = await prisma.liveSession.findMany({
      orderBy: { scheduledAt: "desc" }
    });
    res.status(200).json(sessions);
  } catch (error) {
    next(error);
  }
};

// 2. إنشاء حلقة جديدة
export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createSessionSchema.parse(req.body);

    // جلب البرنامج الأساسي النشط
    const program = await prisma.program.findFirst({
      where: { isActive: true }
    });
    if (!program)
      throw Object.assign(new Error("لم يتم العثور على برنامج نشط"), {
        statusCode: 404
      });

    const session = await prisma.liveSession.create({
      data: { ...data, programId: program.id }
    });

    res.status(201).json({ message: "تم إنشاء الحلقة بنجاح", session });
  } catch (error) {
    next(error);
  }
};

// 3. تعديل الحلقة
export const updateSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const data = updateSessionSchema.parse(req.body);

    const session = await prisma.liveSession.update({
      where: { id },
      data
    });

    res.status(200).json({ message: "تم تعديل الحلقة بنجاح", session });
  } catch (error) {
    next(error);
  }
};

// 4. حذف الحلقة
export const deleteSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    await prisma.liveSession.delete({ where: { id } });
    res.status(200).json({ message: "تم حذف الحلقة بنجاح" });
  } catch (error) {
    next(error);
  }
};

// 5. جلب غياب وحضور حلقة معينة
export const getAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.params.sessionId as string;

    // نجيب كل الطالبات المفعلات
    const activeStudents = await prisma.user.findMany({
      where: { role: "STUDENT", status: "ACTIVE" },
      select: { id: true, name: true }
    });

    // نجيب الحضور اللي اتسجل قبل كده للحلقة دي
    const attendanceRecords = await prisma.attendance.findMany({
      where: { sessionId }
    });

    // دمج البيانات عشان المعلمة تشوف كل الطالبات وحالتهم
    const attendanceList = activeStudents.map((student) => {
      const record = attendanceRecords.find((r) => r.userId === student.id);
      return {
        userId: student.id,
        name: student.name,
        status: record ? record.status : null // null يعني لسه متسجلش
      };
    });

    res.status(200).json(attendanceList);
  } catch (error) {
    next(error);
  }
};

// 6. حفظ الغياب والحضور لحلقة
export const updateAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.params.sessionId as string;
    const { attendance } = updateAttendanceSchema.parse(req.body);

    // Prisma مافيهاش Bulk Upsert مباشر، فبنستخدم Transaction
    const upsertPromises = attendance.map((record) =>
      prisma.attendance.upsert({
        where: {
          sessionId_userId: { sessionId, userId: record.userId }
        },
        update: { status: record.status },
        create: {
          sessionId,
          userId: record.userId,
          status: record.status
        }
      })
    );

    await prisma.$transaction(upsertPromises);

    res.status(200).json({ message: "تم حفظ الغياب والحضور بنجاح" });
  } catch (error) {
    next(error);
  }
};
