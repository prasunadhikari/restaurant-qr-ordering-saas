import { Router } from "express";

import {
  login,
  register,
  createDevelopmentAdmin,
  resetDevelopmentAdminPassword,
  managerLogin,
  adminLogin,
} from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/manager/login", managerLogin);
router.post("/admin/login", adminLogin);

// Development only
router.post("/dev-admin", createDevelopmentAdmin);
router.post(
  "/dev-admin/reset-password",
  resetDevelopmentAdminPassword,
);

export default router;