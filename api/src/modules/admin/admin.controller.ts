import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "INACTIVE"])
});

// جلب كل الطالبات
export const getStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json(students);
  } catch (error) {
    next(error);
  }
};

// تفعيل أو تعطيل حساب طالبة
export const updateStudentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const { status } = updateStatusSchema.parse(req.body);

    const student = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, status: true }
    });

    res.status(200).json({
      message: "تم تحديث حالة الطالبة بنجاح",
      student
    });
  } catch (error) {
    next(error);
  }
};
