import { Router } from "express";

import {
  login,
  register,
  createDevelopmentAdmin,
} from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// Development only
router.post("/dev-admin", createDevelopmentAdmin);

export default router;