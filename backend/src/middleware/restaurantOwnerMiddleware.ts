import { NextFunction, Response } from "express";

import { AuthenticatedRequest } from "./authMiddleware.js";

const restaurantOwnerMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user?.role !== "restaurant_owner" || !req.user.restaurantId) {
    res.status(403).json({
      success: false,
      message: "Restaurant owner access required",
    });
    return;
  }

  next();
};

export default restaurantOwnerMiddleware;
