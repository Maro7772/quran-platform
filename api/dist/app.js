import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./modules/auth/auth.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import studentRoutes from "./modules/student/student.routes.js";
import path from "path";
const app = express();
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
}));
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve uploaded videos and files statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
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
//# sourceMappingURL=app.js.map