import { Router } from "express";
import { getStudents, updateStudentStatus } from "./admin.controller.js";
import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  getAttendance,
  updateAttendance
} from "./session.controller.js";
import {
  getRecordings,
  createRecording,
  updateRecording,
  updateRecordingAccess,
  publishRecording,
  deleteRecording,
  uploadVideoFile,
  getRecordingPlayback,
  getUploadSignature
} from "./recording.controller.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { uploadVideo } from "../../middleware/upload.middleware.js";

const router = Router();

// تطبيق الحماية على كل الـ routes الجاية بحيث لازم يكون Admin
router.use(authenticate, authorize(["ADMIN"]));

// --- Students Management ---
router.get("/students", getStudents);
router.patch("/students/:id/status", updateStudentStatus);

// --- Live Sessions Management ---
router.get("/sessions", getSessions);
router.post("/sessions", createSession);
router.patch("/sessions/:id", updateSession);
router.delete("/sessions/:id", deleteSession);

// --- Attendance Management ---
router.get("/attendance/:sessionId", getAttendance);
router.put("/attendance/:sessionId", updateAttendance);

// --- Recordings Management ---
router.get("/recordings", getRecordings);
router.get("/recordings/upload-signature", getUploadSignature);
router.get("/recordings/:id/playback", getRecordingPlayback);
router.post("/recordings", createRecording);
router.post("/recordings/upload", uploadVideo.single("video"), uploadVideoFile);
router.patch("/recordings/:id", updateRecording);
router.put("/recordings/:id/access", updateRecordingAccess);
router.post("/recordings/:id/publish", publishRecording);
router.delete("/recordings/:id", deleteRecording);

export default router;

