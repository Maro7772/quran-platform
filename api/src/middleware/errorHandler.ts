import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "بيانات غير صالحة",
      errors: err.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message
      }))
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "حدث خطأ في السيرفر";

  return res.status(statusCode).json({ message });
};
