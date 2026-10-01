import { Router } from "express";

import {
  login,
  register,
  createDevelopmentAdmin,
  resetDevelopmentAdminPassword,
} from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// Development only
router.post("/dev-admin", createDevelopmentAdmin);
router.post(
  "/dev-admin/reset-password",
  resetDevelopmentAdminPassword,
);

export default router;