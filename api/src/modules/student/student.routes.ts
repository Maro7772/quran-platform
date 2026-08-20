import { Router } from "express";
import {
  getUpcomingSession,
  getStudentSessions,
  getStudentRecordings,
  getStudentAttendance,
  getPlaybackUrl
} from "./student.controller.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";

const router = Router();

// حماية المسارات (يجب أن تكون طالبة أو معلمة ومفعلة ACTIVE)
router.use(authenticate, authorize(["STUDENT", "ADMIN"]));

router.get("/sessions/upcoming", getUpcomingSession);
router.get("/sessions", getStudentSessions);
router.get("/recordings", getStudentRecordings);
router.get("/attendance", getStudentAttendance);
router.get("/recordings/:id/playback", getPlaybackUrl);

export default router;

