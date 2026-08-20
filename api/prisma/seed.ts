import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/config/db.js";

async function main() {
  console.log("🌱 جاري حقن البيانات الشاملة للاختبار...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. إنشاء البرنامج
  const program = await prisma.program.create({
    data: {
      title: "تحفيظ وتدبر القرآن",
      description:
        "برنامج مخصص للسيدات لحفظ وتلاوة وتدبر القرآن الكريم في حلقات مباشرة.",
      isActive: true
    }
  });
  console.log("✅ تم إنشاء البرنامج");

  // 2. إنشاء المعلمة (Admin)
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@quran-platform.com" },
    update: {},
    create: {
      name: "المعلمة أماني",
      email: "teacher@quran-platform.com",
      phone: "01000000000",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE"
    }
  });
  console.log("✅ تم إنشاء حساب المعلمة");

  // 3. إنشاء طالبتين (واحدة مفعلة، وواحدة في الانتظار)
  const activeStudent = await prisma.user.upsert({
    where: { email: "sarah@example.com" },
    update: {},
    create: {
      name: "سارة أحمد",
      email: "sarah@example.com",
      phone: "01111111111",
      passwordHash,
      role: "STUDENT",
      status: "ACTIVE" // جاهزة للدخول
    }
  });

  const pendingStudent = await prisma.user.upsert({
    where: { email: "mariam@example.com" },
    update: {},
    create: {
      name: "مريم محمود",
      email: "mariam@example.com",
      phone: "01222222222",
      passwordHash,
      role: "STUDENT",
      status: "PENDING" // تحتاج موافقة المعلمة
    }
  });
  console.log("✅ تم إنشاء حسابات الطالبات (سارة ومريم)");

  // 4. إنشاء حلقة سابقة وحلقة قادمة
  const pastSession = await prisma.liveSession.create({
    data: {
      programId: program.id,
      title: "الحلقة 1: سورة البقرة",
      scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // من يومين
      durationMinutes: 60,
      status: "COMPLETED"
    }
  });

  const upcomingSession = await prisma.liveSession.create({
    data: {
      programId: program.id,
      title: "الحلقة 2: سورة آل عمران",
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // بعد يومين
      durationMinutes: 60,
      meetingUrl: "https://zoom.us/j/123456789",
      status: "SCHEDULED"
    }
  });
  console.log("✅ تم إنشاء الحلقات (سابقة وقادمة)");

  // 5. تسجيل حضور الطالبة سارة في الحلقة السابقة
  await prisma.attendance.create({
    data: {
      sessionId: pastSession.id,
      userId: activeStudent.id,
      status: "PRESENT"
    }
  });
  console.log("✅ تم تسجيل الحضور للحلقة السابقة");

  // 6. رفع ونشر تسجيل للحلقة السابقة (صلاحية للحاضرات فقط)
  await prisma.recording.create({
    data: {
      sessionId: pastSession.id,
      title: "تسجيل الحلقة 1",
      storageKey: "video_file_789.mp4",
      status: "PUBLISHED",
      accessMode: "ATTENDEES_ONLY",
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // تنتهي بعد 7 أيام
    }
  });
  console.log("✅ تم نشر تسجيل الفيديو بصلاحية (للحاضرات فقط)");

  console.log("🎉 تم بناء قاعدة البيانات بالكامل وجاهزة للاختبار!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
