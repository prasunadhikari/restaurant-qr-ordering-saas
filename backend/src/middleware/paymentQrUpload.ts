import { mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import type { RequestHandler } from "express";
import multer from "multer";

const uploadDirectory = resolve(process.cwd(), "uploads", "payment-qr");

const extensionByMimeType: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const paymentQrUpload = multer({
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
        callback(new Error("Only JPEG, PNG, and WebP QR images are supported"), "");
        return;
      }
      callback(null, `${randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!extensionByMimeType[file.mimetype]) {
      callback(new Error("Only JPEG, PNG, and WebP QR images are supported"));
      return;
    }
    callback(null, true);
  },
});

export const uploadPaymentQrImage: RequestHandler = (req, res, next) => {
  paymentQrUpload.single("image")(req, res, (error: unknown) => {
    if (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to process the QR image",
      });
      return;
    }
    next();
  });
};
