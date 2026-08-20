import { z } from "zod";
export declare const createSessionSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    scheduledAt: z.ZodString;
    durationMinutes: z.ZodNumber;
    meetingUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, z.core.$strip>;
export declare const updateSessionSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    scheduledAt: z.ZodOptional<z.ZodString>;
    durationMinutes: z.ZodOptional<z.ZodNumber>;
    meetingUrl: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
}, z.core.$strip>;
export declare const updateAttendanceSchema: z.ZodObject<{
    attendance: z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        status: z.ZodEnum<{
            ABSENT: "ABSENT";
            PRESENT: "PRESENT";
        }>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const createRecordingSchema: z.ZodObject<{
    sessionId: z.ZodString;
    title: z.ZodString;
    storageKey: z.ZodString;
    accessMode: z.ZodEnum<{
        ALL_ACTIVE_STUDENTS: "ALL_ACTIVE_STUDENTS";
        ATTENDEES_ONLY: "ATTENDEES_ONLY";
        SELECTED_STUDENTS: "SELECTED_STUDENTS";
    }>;
    selectedUserIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    publishNow: z.ZodOptional<z.ZodBoolean>;
    durationDays: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    autoTargetAbsent: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const updateRecordingSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    storageKey: z.ZodOptional<z.ZodString>;
    accessMode: z.ZodOptional<z.ZodEnum<{
        ALL_ACTIVE_STUDENTS: "ALL_ACTIVE_STUDENTS";
        ATTENDEES_ONLY: "ATTENDEES_ONLY";
        SELECTED_STUDENTS: "SELECTED_STUDENTS";
    }>>;
    selectedUserIds: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    publishNow: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    durationDays: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodNumber>>>;
    autoTargetAbsent: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateRecordingAccessSchema: z.ZodObject<{
    selectedUserIds: z.ZodArray<z.ZodString>;
    accessMode: z.ZodOptional<z.ZodEnum<{
        ALL_ACTIVE_STUDENTS: "ALL_ACTIVE_STUDENTS";
        ATTENDEES_ONLY: "ATTENDEES_ONLY";
        SELECTED_STUDENTS: "SELECTED_STUDENTS";
    }>>;
    durationDays: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const publishRecordingSchema: z.ZodObject<{
    selectedUserIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    durationDays: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    autoTargetAbsent: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
//# sourceMappingURL=admin.schema.d.ts.map