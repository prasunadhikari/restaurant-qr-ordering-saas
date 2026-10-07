import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./authMiddleware.js";

const managerMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user?.role !== "restaurant_manager" || !req.user.restaurantId) {
    res.status(403).json({
      success: false,
      message: "Restaurant manager access required",
    });
    return;
  }
  next();
};

export default managerMiddleware;
