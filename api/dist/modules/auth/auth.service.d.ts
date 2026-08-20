import type { RegisterInput, LoginInput, ForgotPasswordInput, VerifyResetCodeInput, ResetPasswordInput } from "./auth.schema.js";
/**
 * 1. تسجيل طالبة جديدة (برقم الهاتف والاسم وكلمة المرور، والإيميل اختياري)
 */
export declare const registerStudent: (data: RegisterInput) => Promise<{
    createdAt: Date;
    email: string | null;
    id: string;
    name: string;
    phone: string;
    role: import("../../generated/enums.js").Role;
    status: import("../../generated/enums.js").UserStatus;
}>;
/**
 * 2. تسجيل الدخول (برقم الهاتف أو البريد + كلمة المرور)
 */
export declare const loginUser: (data: LoginInput) => Promise<{
    token: string;
    user: {
        id: string;
        name: string;
        phone: string;
        email: string | null;
        role: import("../../generated/enums.js").Role;
        status: "ACTIVE";
    };
}>;
/**
 * 3. طلب استعادة كلمة المرور وإرسال رمز التحقق عبر واتساب (صلاحية 30 دقيقة)
 */
export declare const requestPasswordReset: (data: ForgotPasswordInput) => Promise<{
    message: string;
    phone: string;
    senderPhone: string;
    whatsappUrl: string;
    whatsappAdminUrl: string;
    automatedSuccess: boolean;
    code: string;
    expiresInMinutes: number;
}>;
/**
 * 4. التحقق من صحة كود الـ OTP
 */
export declare const verifyResetCode: (data: VerifyResetCodeInput) => Promise<{
    message: string;
    valid: boolean;
    token: string;
    phone: string | null;
}>;
/**
 * 5. تعيين كلمة المرور الجديدة وتحديثها في قاعدة البيانات
 */
export declare const executePasswordReset: (data: ResetPasswordInput) => Promise<{
    message: string;
}>;
//# sourceMappingURL=auth.service.d.ts.map