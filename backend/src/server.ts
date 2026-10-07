import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import restaurantDataRoutes from "./routes/restaurantDataRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/restaurant", restaurantDataRoutes);

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