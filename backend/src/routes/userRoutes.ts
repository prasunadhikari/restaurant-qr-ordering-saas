import { Router } from "express";

import authMiddleware, {
  AuthenticatedRequest,
} from "../middleware/authMiddleware.js";

const router = Router();

router.get(
  "/me",
  authMiddleware,
  (req: AuthenticatedRequest, res) => {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  },
);

export default router;