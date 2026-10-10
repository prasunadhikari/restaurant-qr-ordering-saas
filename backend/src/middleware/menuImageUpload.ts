import { mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import multer from "multer";
import { uploadPath } from "../utils/uploadStorage.js";

const uploadDirectory = uploadPath("menu");

const extensionByMimeType: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const menuImageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => {
      void mkdir(uploadDirectory, { recursive: true })
        .then(() => callback(null, uploadDirectory))
        .catch((error: unknown) =>
          callback(
            error instanceof Error ? error : new Error(String(error)),
            uploadDirectory,
          ),
        );
    },
    filename: (_req, file, callback) => {
      const extension = extensionByMimeType[file.mimetype];
      if (!extension) {
        callback(new Error("Only JPEG, PNG, and WebP dish photos are supported"), "");
        return;
      }
      callback(null, `${randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!extensionByMimeType[file.mimetype]) {
      callback(new Error("Only JPEG, PNG, and WebP dish photos are supported"));
      return;
    }
    callback(null, true);
  },
});

export const uploadMenuImage: RequestHandler = (req, res, next) => {
  menuImageUpload.single("image")(req, res, (error: unknown) => {
    if (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to process the uploaded dish photo",
      });
      return;
    }
    next();
  });
};
