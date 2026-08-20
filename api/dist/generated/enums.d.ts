export declare const Role: {
    readonly STUDENT: 'STUDENT';
    readonly ADMIN: 'ADMIN';
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const UserStatus: {
    readonly PENDING: 'PENDING';
    readonly ACTIVE: 'ACTIVE';
    readonly INACTIVE: 'INACTIVE';
};
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
export declare const AttendanceStatus: {
    readonly PRESENT: 'PRESENT';
    readonly ABSENT: 'ABSENT';
};
export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];
export declare const RecordingAccessMode: {
    readonly ALL_ACTIVE_STUDENTS: 'ALL_ACTIVE_STUDENTS';
    readonly ATTENDEES_ONLY: 'ATTENDEES_ONLY';
    readonly SELECTED_STUDENTS: 'SELECTED_STUDENTS';
};
export type RecordingAccessMode = (typeof RecordingAccessMode)[keyof typeof RecordingAccessMode];
export declare const RecordingStatus: {
    readonly DRAFT: 'DRAFT';
    readonly PUBLISHED: 'PUBLISHED';
    readonly EXPIRED: 'EXPIRED';
};
export type RecordingStatus = (typeof RecordingStatus)[keyof typeof RecordingStatus];
//# sourceMappingURL=enums.d.ts.map