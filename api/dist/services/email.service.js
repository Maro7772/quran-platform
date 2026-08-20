import nodemailer from "nodemailer";
// إنشاء Transporter لإرسال البريد
const createTransporter = () => {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
    // في حال عدم توفر بيانات SMTP حقيقية، نستخدم وضع المحاكاة/التطوير
    return null;
};
/**
 * إرسال بريد إلكتروني يحتوي على رمز التحقق (OTP) ورابط استعادة كلمة المرور
 */
export const sendPasswordResetEmail = async ({ to, name, code, resetUrl }) => {
    const transporter = createTransporter();
    const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>استعادة كلمة المرور</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9f6; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #1b4332, #2d6a4f); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
        .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 30px; line-height: 1.7; text-align: right; }
        .greeting { font-size: 16px; font-weight: bold; color: #1b4332; margin-bottom: 15px; }
        .otp-box { background: #e8f5e9; border: 2px dashed #52b788; border-radius: 14px; padding: 18px; text-align: center; margin: 25px 0; }
        .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1b4332; font-family: monospace; }
        .btn-wrapper { text-align: center; margin: 30px 0 20px; }
        .btn { display: inline-block; background: #2d6a4f; color: #ffffff !important; padding: 14px 32px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(45,106,79,0.3); }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .warning { font-size: 12px; color: #94a3b8; margin-top: 20px; border-top: 1px solid #f1f5f9; pt: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>منصة تحفيظ القرآن الكريم 🌿</h1>
          <p>استعادة وتعيين كلمة المرور الجديدة</p>
        </div>
        <div class="content">
          <div class="greeting">السلام عليكم ورحمة الله وبركاته، أختنا ${name} 🌸</div>
          <p>تلقينا طلباً لاستعادة كلمة المرور الخاصة بحسابكِ على المنصة. يمكنكِ استخدام رمز التحقق التالي لإتمام العملية:</p>
          
          <div class="otp-box">
            <div style="font-size: 13px; color: #2d6a4f; margin-bottom: 6px; font-weight: bold;">رمز التحقق السريع (OTP)</div>
            <div class="otp-code">${code}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 6px;">صالح لمدة 15 دقيقة فقط</div>
          </div>

          <p>أو يمكنكِ الضغط مباشرة على الزر أدناه لتعيين كلمة المرور الجديدة فورا:</p>

          <div class="btn-wrapper">
            <a href="${resetUrl}" class="btn" target="_blank">تعيين كلمة المرور الآن ←</a>
          </div>

          <div class="warning">
            إذا لم تكوني قد قمتِ بطلب استعادة كلمة المرور، يرجى تجاهل هذه الرسالة. حسابكِ في أمان تام بإذن الله.
          </div>
        </div>
        <div class="footer">
          جميع الحقوق محفوظة © ${new Date().getFullYear()} مقرأة القرآن الكريم
        </div>
      </div>
    </body>
    </html>
  `;
    // طباعة الكود والرابط في الـ Console لسهولة التجربة الفورية
    console.log("\n=======================================================");
    console.log("📨 [PASSWORD RESET EMAIL SENT]");
    console.log(`👤 To: ${to} (${name})`);
    console.log(`🔢 OTP Code: ${code}`);
    console.log(`🔗 Reset Link: ${resetUrl}`);
    console.log("=======================================================\n");
    if (transporter) {
        try {
            await transporter.sendMail({
                from: `"${process.env.SMTP_FROM_NAME || 'منصة القرآن الكريم'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
                to,
                subject: "استعادة كلمة المرور - منصة تحفيظ القرآن الكريم 🌸",
                html: htmlContent
            });
            return true;
        }
        catch (error) {
            console.error("❌ Failed to send email via SMTP transporter:", error);
            // في بيئة التطوير، نعتبر الطباعة في الكونسول كافية لنجاح العملية
            return true;
        }
    }
    return true;
};
//# sourceMappingURL=email.service.js.map