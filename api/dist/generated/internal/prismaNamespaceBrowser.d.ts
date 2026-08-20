import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly User: 'User';
    readonly Program: 'Program';
    readonly Enrollment: 'Enrollment';
    readonly LiveSession: 'LiveSession';
    readonly Attendance: 'Attendance';
    readonly Recording: 'Recording';
    readonly RecordingAccess: 'RecordingAccess';
    readonly TeacherNote: 'TeacherNote';
    readonly PasswordReset: 'PasswordReset';
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: 'ReadUncommitted';
    readonly ReadCommitted: 'ReadCommitted';
    readonly RepeatableRead: 'RepeatableRead';
    readonly Serializable: 'Serializable';
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: 'id';
    readonly name: 'name';
    readonly email: 'email';
    readonly phone: 'phone';
    readonly passwordHash: 'passwordHash';
    readonly role: 'role';
    readonly status: 'status';
    readonly createdAt: 'createdAt';
    readonly updatedAt: 'updatedAt';
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const ProgramScalarFieldEnum: {
    readonly id: 'id';
    readonly title: 'title';
    readonly description: 'description';
    readonly isActive: 'isActive';
    readonly createdAt: 'createdAt';
    readonly updatedAt: 'updatedAt';
};
export type ProgramScalarFieldEnum = (typeof ProgramScalarFieldEnum)[keyof typeof ProgramScalarFieldEnum];
export declare const EnrollmentScalarFieldEnum: {
    readonly id: 'id';
    readonly userId: 'userId';
    readonly programId: 'programId';
    readonly status: 'status';
    readonly joinedAt: 'joinedAt';
    readonly createdAt: 'createdAt';
    readonly updatedAt: 'updatedAt';
};
export type EnrollmentScalarFieldEnum = (typeof EnrollmentScalarFieldEnum)[keyof typeof EnrollmentScalarFieldEnum];
export declare const LiveSessionScalarFieldEnum: {
    readonly id: 'id';
    readonly programId: 'programId';
    readonly title: 'title';
    readonly description: 'description';
    readonly scheduledAt: 'scheduledAt';
    readonly durationMinutes: 'durationMinutes';
    readonly meetingUrl: 'meetingUrl';
    readonly status: 'status';
    readonly createdAt: 'createdAt';
    readonly updatedAt: 'updatedAt';
};
export type LiveSessionScalarFieldEnum = (typeof LiveSessionScalarFieldEnum)[keyof typeof LiveSessionScalarFieldEnum];
export declare const AttendanceScalarFieldEnum: {
    readonly id: 'id';
    readonly sessionId: 'sessionId';
    readonly userId: 'userId';
    readonly status: 'status';
    readonly createdAt: 'createdAt';
};
export type AttendanceScalarFieldEnum = (typeof AttendanceScalarFieldEnum)[keyof typeof AttendanceScalarFieldEnum];
export declare const RecordingScalarFieldEnum: {
    readonly id: 'id';
    readonly sessionId: 'sessionId';
    readonly title: 'title';
    readonly storageKey: 'storageKey';
    readonly publishedAt: 'publishedAt';
    readonly expiresAt: 'expiresAt';
    readonly accessMode: 'accessMode';
    readonly status: 'status';
    readonly createdAt: 'createdAt';
    readonly updatedAt: 'updatedAt';
};
export type RecordingScalarFieldEnum = (typeof RecordingScalarFieldEnum)[keyof typeof RecordingScalarFieldEnum];
export declare const RecordingAccessScalarFieldEnum: {
    readonly id: 'id';
    readonly recordingId: 'recordingId';
    readonly userId: 'userId';
    readonly expiresAt: 'expiresAt';
    readonly createdAt: 'createdAt';
};
export type RecordingAccessScalarFieldEnum = (typeof RecordingAccessScalarFieldEnum)[keyof typeof RecordingAccessScalarFieldEnum];
export declare const TeacherNoteScalarFieldEnum: {
    readonly id: 'id';
    readonly sessionId: 'sessionId';
    readonly content: 'content';
    readonly createdAt: 'createdAt';
    readonly updatedAt: 'updatedAt';
};
export type TeacherNoteScalarFieldEnum = (typeof TeacherNoteScalarFieldEnum)[keyof typeof TeacherNoteScalarFieldEnum];
export declare const PasswordResetScalarFieldEnum: {
    readonly id: 'id';
    readonly phone: 'phone';
    readonly email: 'email';
    readonly code: 'code';
    readonly token: 'token';
    readonly expiresAt: 'expiresAt';
    readonly createdAt: 'createdAt';
};
export type PasswordResetScalarFieldEnum = (typeof PasswordResetScalarFieldEnum)[keyof typeof PasswordResetScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: 'asc';
    readonly desc: 'desc';
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const QueryMode: {
    readonly default: 'default';
    readonly insensitive: 'insensitive';
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: 'first';
    readonly last: 'last';
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
//# sourceMappingURL=prismaNamespaceBrowser.d.ts.map