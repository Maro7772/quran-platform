import { z } from "zod";

export const createSessionSchema = z.object({
  title: z.string().min(2, "عنوان الحلقة مطلوب"),
  description: z.string().optional(),
  scheduledAt: z.string().datetime({ message: "تاريخ ووقت غير صالحين" }),
  durationMinutes: z
    .number()
    .min(10, "مدة الحلقة يجب أن تكون 10 دقائق على الأقل"),
  meetingUrl: z
    .string()
    .url("رابط الاجتماع غير صالح")
    .optional()
    .or(z.literal(""))
});

export const updateSessionSchema = createSessionSchema.partial();

export const updateAttendanceSchema = z.object({
  attendance: z.array(
    z.object({
      userId: z.string().uuid(),
      status: z.enum(["PRESENT", "ABSENT"])
    })
  )
});

export const createRecordingSchema = z.object({
  sessionId: z.string().uuid("معرف الحلقة غير صالح"),
  title: z.string().min(2, "عنوان التسجيل مطلوب"),
  storageKey: z.string().min(1, "معرف التخزين (Storage Key) مطلوب"),
  accessMode: z.enum([
    "ALL_ACTIVE_STUDENTS",
    "ATTENDEES_ONLY",
    "SELECTED_STUDENTS"
  ]),
  selectedUserIds: z.array(z.string().uuid()).optional(),
  publishNow: z.boolean().optional(),
  durationDays: z.number().min(1).max(365).optional().default(7),
  autoTargetAbsent: z.boolean().optional()
});

export const updateRecordingSchema = createRecordingSchema.partial();

export const updateRecordingAccessSchema = z.object({
  selectedUserIds: z.array(z.string().uuid()),
  accessMode: z.enum([
    "ALL_ACTIVE_STUDENTS",
    "ATTENDEES_ONLY",
    "SELECTED_STUDENTS"
  ]).optional(),
  durationDays: z.number().min(1).max(365).optional()
});

export const publishRecordingSchema = z.object({
  // مصفوفة بمعرفات الطالبات لو اختارت المعلمة SELECTED_STUDENTS
  selectedUserIds: z.array(z.string().uuid()).optional(),
  // مدة الصلاحية بالأيام (افتراضياً 7 أيام)
  durationDays: z.number().min(1).max(365).optional().default(7),
  // هل يتم تحديد الغائبات عن الحلقة تلقائياً؟
  autoTargetAbsent: z.boolean().optional(),
});


