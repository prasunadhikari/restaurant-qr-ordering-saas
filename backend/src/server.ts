import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { resolve } from "node:path";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import restaurantDataRoutes from "./routes/restaurantDataRoutes.js";
import publicCustomerRoutes from "./routes/publicCustomerRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

app.use(express.json());
app.use("/uploads", express.static(resolve(process.cwd(), "uploads"), {
  dotfiles: "deny",
  index: false,
  redirect: false,
}));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/restaurant", restaurantDataRoutes);
app.use("/api/public", publicCustomerRoutes);
app.use("/api/staff", staffRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Restaurant QR Ordering API is running",
  });
});

const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();