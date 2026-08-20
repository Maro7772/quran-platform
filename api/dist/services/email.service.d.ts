interface SendResetEmailParams {
    to: string;
    name: string;
    code: string;
    resetUrl: string;
}
/**
 * إرسال بريد إلكتروني يحتوي على رمز التحقق (OTP) ورابط استعادة كلمة المرور
 */
export declare const sendPasswordResetEmail: ({ to, name, code, resetUrl }: SendResetEmailParams) => Promise<boolean>;
export {};
//# sourceMappingURL=email.service.d.ts.map