import type { Request, Response, NextFunction } from "express";
export declare const getRecordings: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const uploadVideoFile: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createRecording: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateRecording: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateRecordingAccess: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const publishRecording: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteRecording: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getRecordingPlayback: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=recording.controller.d.ts.map