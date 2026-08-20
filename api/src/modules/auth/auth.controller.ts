import type { Request, Response, NextFunction } from "express";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyResetCodeSchema,
  resetPasswordSchema
} from "./auth.schema.js";
import {
  registerStudent,
  loginUser,
  requestPasswordReset,
  verifyResetCode as verifyCodeService,
  executePasswordReset
} from "./auth.service.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const user = await registerStudent(validatedData);
    res.status(201).json({
      message: "تم التسجيل بنجاح، في انتظار تفعيل الحساب من المعلمة",
      user
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { token, user } = await loginUser(validatedData);

    const isProduction = process.env.NODE_ENV === "production";

    // إعداد الـ HttpOnly Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: "تم تسجيل الدخول بنجاح",
      user
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax"
    });

    res.status(200).json({
      message: "تم تسجيل الخروج بنجاح"
    });
  } catch (error) {
    next(error);
  }
};

// 4. طلب استعادة كلمة المرور وإرسال رمز التحقق
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = forgotPasswordSchema.parse(req.body);
    const result = await requestPasswordReset(validatedData);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// 5. التحقق من كود الـ OTP
export const verifyResetCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = verifyResetCodeSchema.parse(req.body);
    const result = await verifyCodeService(validatedData);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// 6. تعيين كلمة المرور الجديدة
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    const result = await executePasswordReset(validatedData);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
