import { NextFunction, Response } from "express";

import { AuthenticatedRequest } from "./authMiddleware.js";

const adminMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return;
  }

  if (req.user.role !== "platform_admin") {
    res.status(403).json({
      success: false,
      message: "Platform admin access required",
    });

    return;
  }

  next();
};

export default adminMiddleware;