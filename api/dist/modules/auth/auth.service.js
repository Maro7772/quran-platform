import crypto from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../config/db.js";
import { sendPasswordResetEmail } from "../../services/email.service.js";
import { sendWhatsAppResetOTP } from "../../services/whatsapp.service.js";
/**
 * 1. تسجيل طالبة جديدة (برقم الهاتف والاسم وكلمة المرور، والإيميل اختياري)
 */
export const registerStudent = async (data) => {
    const phone = data.phone.trim();
    const email = data.email && data.email.trim() ? data.email.trim().toLowerCase() : null;
    // التحقق من تكرار رقم الهاتف
    const existingPhone = await prisma.user.findFirst({
        where: { phone }
    });
    if (existingPhone) {
        const error = new Error("رقم الهاتف (واتساب) مسجل بالفعل، يمكنكِ تسجيل الدخول مباشرة");
        error.statusCode = 400;
        throw error;
    }
    // التحقق من تكرار الإيميل إن وجد
    if (email) {
        const existingEmail = await prisma.user.findFirst({
            where: { email }
        });
        if (existingEmail) {
            const error = new Error("البريد الإلكتروني مسجل بالفعل لحساب آخر");
            error.statusCode = 400;
            throw error;
        }
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
        data: {
            name: data.name.trim(),
            phone,
            email,
            passwordHash,
            role: "STUDENT",
            status: "PENDING" // حساب معلق لحين تفعيل المعلمة
        },
        select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            role: true,
            status: true,
            createdAt: true
        }
    });
    return user;
};
/**
 * 2. تسجيل الدخول (برقم الهاتف أو البريد + كلمة المرور)
 */
export const loginUser = async (data) => {
    const identifier = (data.identifier || data.phone || data.email || "").trim();
    if (!identifier) {
        const error = new Error("يرجى إدخال رقم الهاتف أو البريد الإلكتروني");
        error.statusCode = 400;
        throw error;
    }
    // البحث بالهاتف أولاً أو بالبريد
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { phone: identifier },
                { email: identifier.toLowerCase() }
            ]
        }
    });
    if (!user) {
        const error = new Error("رقم الهاتف أو كلمة المرور غير صحيحة");
        error.statusCode = 401;
        throw error;
    }
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
        const error = new Error("رقم الهاتف أو كلمة المرور غير صحيحة");
        error.statusCode = 401;
        throw error;
    }
    if (user.status !== "ACTIVE") {
        const error = new Error("حسابكِ قيد المراجعة أو غير مفعل من المعلمة بعد");
        error.statusCode = 403;
        throw error;
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") });
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role,
            status: user.status
        }
    };
};
/**
 * 3. طلب استعادة كلمة المرور وإرسال رمز التحقق عبر واتساب (صلاحية 30 دقيقة)
 */
export const requestPasswordReset = async (data) => {
    const phoneInput = data.phone?.trim();
    const emailInput = data.email?.trim().toLowerCase();
    // البحث عن المستخدم بالهاتف أو بالبريد
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                ...(phoneInput ? [{ phone: phoneInput }] : []),
                ...(emailInput ? [{ email: emailInput }] : [])
            ]
        }
    });
    if (!user) {
        const error = new Error("رقم الهاتف غير مسجل لدينا، يرجى التأكد من الرقم المدخل");
        error.statusCode = 404;
        throw error;
    }
    // توليد رمز OTP سداسي عشوائي مشفر
    const code = crypto.randomInt(100000, 999999).toString();
    // توليد توكن رابط مباشر مشفر
    const token = crypto.randomBytes(32).toString("hex");
    // صلاحية الرمز: 30 دقيقة
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    // مسح أي طلبات سابقة معلقة لهذا الهاتف أو البريد
    await prisma.passwordReset.deleteMany({
        where: {
            OR: [
                { phone: user.phone },
                ...(user.email ? [{ email: user.email }] : [])
            ]
        }
    });
    // حفظ الطلب الجديد في قاعدة البيانات
    await prisma.passwordReset.create({
        data: {
            phone: user.phone,
            email: user.email,
            code,
            token,
            expiresAt
        }
    });
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/forgot-password?token=${token}&phone=${encodeURIComponent(user.phone)}`;
    // تجهيز وإرسال رسالة الواتساب
    const whatsappData = await sendWhatsAppResetOTP({
        phone: user.phone,
        name: user.name,
        code,
        resetUrl
    });
    // إذا كان لدى المستخدم بريد مسجل، نرسل أيضاً نسخة احتياطية على البريد
    if (user.email) {
        await sendPasswordResetEmail({
            to: user.email,
            name: user.name,
            code,
            resetUrl
        });
    }
    return {
        message: "تم تجهيز رمز التحقق (OTP) ورابط الاستعادة من رقم المنصة 🌸",
        phone: user.phone,
        senderPhone: whatsappData.senderPhone,
        whatsappUrl: whatsappData.whatsappUrl,
        whatsappAdminUrl: whatsappData.whatsappAdminUrl,
        automatedSuccess: whatsappData.automatedSuccess,
        code,
        expiresInMinutes: 30
    };
};
/**
 * 4. التحقق من صحة كود الـ OTP
 */
export const verifyResetCode = async (data) => {
    const phoneInput = data.phone?.trim();
    const emailInput = data.email?.trim().toLowerCase();
    const resetRecord = await prisma.passwordReset.findFirst({
        where: {
            OR: [
                ...(phoneInput ? [{ phone: phoneInput }] : []),
                ...(emailInput ? [{ email: emailInput }] : [])
            ],
            code: data.code.trim()
        }
    });
    if (!resetRecord) {
        const error = new Error("رمز التحقق غير صحيح، يرجى التأكد من الرمز المدخل");
        error.statusCode = 400;
        throw error;
    }
    if (new Date() > resetRecord.expiresAt) {
        await prisma.passwordReset.delete({ where: { id: resetRecord.id } });
        const error = new Error("انتهت صلاحية رمز التحقق (30 دقيقة)، يرجى طلب رمز جديد");
        error.statusCode = 400;
        throw error;
    }
    return {
        message: "رمز التحقق صحيح بنجاح",
        valid: true,
        token: resetRecord.token,
        phone: resetRecord.phone
    };
};
/**
 * 5. تعيين كلمة المرور الجديدة وتحديثها في قاعدة البيانات
 */
export const executePasswordReset = async (data) => {
    const phoneInput = data.phone?.trim();
    const emailInput = data.email?.trim().toLowerCase();
    // البحث بواسطة التوكن المباشر أو بواسطة الهاتف/البريد والكود
    const resetRecord = await prisma.passwordReset.findFirst({
        where: {
            OR: [
                ...(data.token ? [{ token: data.token }] : []),
                ...(data.code && phoneInput ? [{ phone: phoneInput, code: data.code.trim() }] : []),
                ...(data.code && emailInput ? [{ email: emailInput, code: data.code.trim() }] : [])
            ]
        }
    });
    if (!resetRecord) {
        const error = new Error("طلب استعادة كلمة المرور غير صالح أو تم استخدامه من قبل");
        error.statusCode = 400;
        throw error;
    }
    if (new Date() > resetRecord.expiresAt) {
        await prisma.passwordReset.delete({ where: { id: resetRecord.id } });
        const error = new Error("انتهت صلاحية طلب الاستعادة، يرجى تقديم طلب جديد");
        error.statusCode = 400;
        throw error;
    }
    // البحث عن المستخدم
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                ...(resetRecord.phone ? [{ phone: resetRecord.phone }] : []),
                ...(resetRecord.email ? [{ email: resetRecord.email }] : [])
            ]
        }
    });
    if (!user) {
        const error = new Error("المستخدم غير موجود");
        error.statusCode = 404;
        throw error;
    }
    // تشفير كلمة المرور الجديدة
    const passwordHash = await bcrypt.hash(data.newPassword, 10);
    // تحديث كلمة المرور وحذف سجلات الاستعادة
    await prisma.$transaction([
        prisma.user.update({
            where: { id: user.id },
            data: { passwordHash }
        }),
        prisma.passwordReset.deleteMany({
            where: {
                OR: [
                    ...(user.phone ? [{ phone: user.phone }] : []),
                    ...(user.email ? [{ email: user.email }] : [])
                ]
            }
        })
    ]);
    return {
        message: "تم تغيير كلمة المرور بنجاح! يمكنكِ الآن تسجيل الدخول برقم هاتفكِ وكلمة المرور الجديدة 🌸"
    };
};
//# sourceMappingURL=auth.service.js.map