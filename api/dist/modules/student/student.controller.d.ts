import type { Request, Response, NextFunction } from "express";
export declare const getUpcomingSession: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getStudentSessions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getStudentRecordings: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getStudentAttendance: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPlaybackUrl: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=student.controller.d.ts.map