import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./modules/auth/auth.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import studentRoutes from "./modules/student/student.routes.js";
import path from "path";
import os from "os";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      // السماح بالطلبات بدون origin أو من أي نطاق vercel أو محلي
      if (!origin) return callback(null, true);
      if (
        origin.endsWith(".vercel.app") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL)
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"]
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded videos and files statically safely
const uploadsPath = process.env.VERCEL
  ? path.join(os.tmpdir(), "uploads")
  : path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));

// Public API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({ message: "Quran Learning Platform API is running" });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
