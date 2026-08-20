interface SendWhatsAppResetParams {
  phone: string;
  name: string;
  code: string;
  resetUrl: string;
}

// رقم الإرسال المعتمد للمنصة
export const SENDER_PHONE = process.env.WHATSAPP_SENDER_PHONE || "01276528220";

/**
 * تنظيف وتنسيق رقم الهاتف ليتوافق مع معايير واتساب الدولية
 * (مثلاً: تحويل 010... أو 011... أو 012... في مصر إلى 2012...)
 */
export const formatWhatsAppPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/[^0-9+]/g, "");

  // إذا كان يبدأ بـ +
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // إذا كان رقم مصري يبدأ بـ 01 (مثال: 010, 011, 012, 015)
  if (cleaned.startsWith("01") && cleaned.length === 11) {
    cleaned = "2" + cleaned;
  }

  return cleaned;
};

/**
 * توليد نص رسالة الواتساب الأنيقة
 */
export const generateWhatsAppResetMessage = ({
  name,
  code,
  resetUrl
}: {
  name: string;
  code: string;
  resetUrl: string;
}): string => {
  return `السلام عليكم ورحمة الله وبركاته، أختنا ${name} 🌸

طلب استعادة كلمة المرور لمنصة تحفيظ القرآن الكريم 🌿:

🔢 رمز التحقق السريع (OTP) الخاص بكِ:
*${code}*

⏳ هذا الرمز صالح لمدة 30 دقيقة.

🔗 أو يمكنكِ تعيين كلمة المرور مباشرة عبر الرابط التالي:
${resetUrl}

إذا لم تطلبي استعادة كلمة المرور، يرجى تجاهل هذه الرسالة. حفظكم الله ورعاكم ✨`;
};

/**
 * تجهيز وإرسال رسالة الواتساب من الرقم المعتمد (01276528220)
 */
export const sendWhatsAppResetOTP = async ({
  phone,
  name,
  code,
  resetUrl
}: SendWhatsAppResetParams) => {
  const formattedRecipientPhone = formatWhatsAppPhoneNumber(phone);
  const formattedSenderPhone = formatWhatsAppPhoneNumber(SENDER_PHONE);
  const messageText = generateWhatsAppResetMessage({ name, code, resetUrl });

  // 1. رابط محادثة مباشر مع رقم المنصة المعتمد (01276528220)
  const helpText = `السلام عليكم، أنا الطالبة ${name}، أطلب المساعدة في استعادة حسابي برقم ${phone}`;
  const whatsappAdminUrl = `https://api.whatsapp.com/send?phone=${formattedSenderPhone}&text=${encodeURIComponent(helpText)}`;

  // 2. رابط إرسال الرسالة مباشرة للمستلم
  const whatsappDirectUrl = `https://api.whatsapp.com/send?phone=${formattedRecipientPhone}&text=${encodeURIComponent(messageText)}`;

  // 3. محاولة الإرسال الآلي التلقائي في حال توفر API Gateway (مثل UltraMsg / Green-API / Wasapi / Twilio)
  let automatedSuccess = false;
  if (process.env.WHATSAPP_API_URL && process.env.WHATSAPP_TOKEN) {
    try {
      const response = await fetch(process.env.WHATSAPP_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: process.env.WHATSAPP_TOKEN,
          to: `+${formattedRecipientPhone}`,
          body: messageText
        })
      });
      automatedSuccess = response.ok;
    } catch (err) {
      console.error("❌ Failed to dispatch automated WhatsApp message via API:", err);
    }
  }

  console.log("\n=======================================================");
  console.log("💬 [WHATSAPP RESET OTP DISPATCHED]");
  console.log(`📤 From (Sender): ${SENDER_PHONE} (+${formattedSenderPhone})`);
  console.log(`📥 To (Recipient): ${name} (${phone} -> +${formattedRecipientPhone})`);
  console.log(`🔢 OTP Code: ${code} (Valid for 30 minutes)`);
  console.log(`🔗 Reset Link: ${resetUrl}`);
  console.log(`📲 Direct Chat with Sender: ${whatsappAdminUrl}`);
  console.log(`📲 Direct Link to Recipient: ${whatsappDirectUrl}`);
  console.log(`🤖 Automated API Sent: ${automatedSuccess ? "YES ✅" : "OFFLINE / PENDING GATEWAY CONFIG"}`);
  console.log("=======================================================\n");

  return {
    senderPhone: SENDER_PHONE,
    formattedSenderPhone,
    recipientPhone: phone,
    formattedRecipientPhone,
    whatsappUrl: whatsappDirectUrl,
    whatsappAdminUrl,
    messageText,
    code,
    resetUrl,
    automatedSuccess
  };
};
