import prisma from "../../config/db.js";
import { z } from "zod";
const updateStatusSchema = z.object({
    status: z.enum(["PENDING", "ACTIVE", "INACTIVE"])
});
// جلب كل الطالبات
export const getStudents = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
// تفعيل أو تعطيل حساب طالبة
export const updateStudentStatus = async (req, res, next) => {
    try {
        const id = req.params.id;
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
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=admin.controller.js.map