import { z } from "zod";
export const registerSchema = z.object({
    name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
    phone: z.string().min(8, "رقم الهاتف غير صحيح"),
    password: z.string().min(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف"),
    email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal(""))
});
export const loginSchema = z.object({
    identifier: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    password: z.string().min(1, "كلمة المرور مطلوبة")
}).refine((data) => data.identifier || data.phone || data.email, {
    message: "يرجى إدخال رقم الهاتف أو البريد الإلكتروني",
    path: ["identifier"]
});
export const forgotPasswordSchema = z
    .object({
    phone: z.string().optional(),
    email: z.string().optional()
})
    .refine((data) => data.phone || data.email, {
    message: "يرجى إدخال رقم الهاتف أو البريد الإلكتروني",
    path: ["phone"]
});
export const verifyResetCodeSchema = z
    .object({
    phone: z.string().optional(),
    email: z.string().optional(),
    code: z.string().length(6, "رمز التحقق يجب أن يتكون من 6 أرقام")
})
    .refine((data) => data.phone || data.email, {
    message: "يرجى إدخال رقم الهاتف أو البريد الإلكتروني",
    path: ["phone"]
});
export const resetPasswordSchema = z
    .object({
    phone: z.string().optional(),
    email: z.string().optional(),
    code: z.string().optional(),
    token: z.string().optional(),
    newPassword: z.string().min(6, "كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف")
})
    .refine((data) => data.code || data.token, {
    message: "يجب توفير كود التحقق أو رابط الاستعادة",
    path: ["code"]
});
//# sourceMappingURL=auth.schema.js.map