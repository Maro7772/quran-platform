import type { Request, Response, NextFunction } from "express";
export declare const getSessions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createSession: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateSession: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteSession: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAttendance: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateAttendance: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=session.controller.d.ts.map