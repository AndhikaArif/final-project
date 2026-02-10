import multer from "multer";
import path from "path";
import { AppError } from "../errors/app.error.js";

export function fileUpload() {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "public");
      },
      filename: (req, file, cb) => {
        const uniqueSuffix =
          "Paparoom" + "-" + Math.round(Math.random() * 1e9) + Date.now();

        const ext = path.extname(file.originalname).toLowerCase();

        const fileName =
          file.fieldname.toUpperCase() + "-" + uniqueSuffix + ext;

        cb(null, fileName);
      },
    }),
    limits: {
      fileSize: 1024 * 1024 * 1,
      files: 1,
    },
    fileFilter: (req, file, cb) => {
      const allowedExt = [".jpg", ".jpeg", ".png", ".gif"];
      const ext = path.extname(file.originalname).toLowerCase();

      if (!allowedExt.includes(ext)) {
        return cb(
          new AppError(
            400,
            "Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed",
          ),
        );
      }

      cb(null, true);
    },
  });
}
