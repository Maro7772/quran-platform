interface SendWhatsAppResetParams {
    phone: string;
    name: string;
    code: string;
    resetUrl: string;
}
export declare const SENDER_PHONE: string;
/**
 * تنظيف وتنسيق رقم الهاتف ليتوافق مع معايير واتساب الدولية
 * (مثلاً: تحويل 010... أو 011... أو 012... في مصر إلى 2012...)
 */
export declare const formatWhatsAppPhoneNumber: (phone: string) => string;
/**
 * توليد نص رسالة الواتساب الأنيقة
 */
export declare const generateWhatsAppResetMessage: ({ name, code, resetUrl }: {
    name: string;
    code: string;
    resetUrl: string;
}) => string;
/**
 * تجهيز وإرسال رسالة الواتساب من الرقم المعتمد (01276528220)
 */
export declare const sendWhatsAppResetOTP: ({ phone, name, code, resetUrl }: SendWhatsAppResetParams) => Promise<{
    senderPhone: string;
    formattedSenderPhone: string;
    recipientPhone: string;
    formattedRecipientPhone: string;
    whatsappUrl: string;
    whatsappAdminUrl: string;
    messageText: string;
    code: string;
    resetUrl: string;
    automatedSuccess: boolean;
}>;
export {};
//# sourceMappingURL=whatsapp.service.d.ts.map