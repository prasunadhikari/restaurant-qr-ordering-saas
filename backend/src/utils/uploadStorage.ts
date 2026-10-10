import "dotenv/config";
import { resolve } from "node:path";

export const uploadsRoot = resolve(
  process.env.UPLOADS_DIR?.trim() || resolve(process.cwd(), "uploads"),
);

export const uploadPath = (...segments: string[]): string =>
  resolve(uploadsRoot, ...segments);
