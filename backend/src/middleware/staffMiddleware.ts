import { NextFunction, Response } from "express";

import { AuthenticatedRequest } from "./authMiddleware.js";

const staffMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user || req.user.role !== "restaurant_staff") {
    res.status(403).json({
      success: false,
      message: "Restaurant staff access required",
    });
    return;
  }

  if (!req.user.restaurantId) {
    res.status(403).json({
      success: false,
      message: "Staff account is not assigned to a restaurant",
    });
    return;
  }

  next();
};

export default staffMiddleware;
