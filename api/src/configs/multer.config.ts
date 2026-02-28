import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

export const upload = multer({
  storage: multer.diskStorage({
    destination: function (_, __, cb) {
      cb(null, uploadDir);
    },
    filename: function (_, file, cb) {
      const uniqueName =
        Date.now() + "-" + file.originalname.replace(/\s/g, "");
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  fileFilter(_, file, cb) {
    const allowed = ["image/jpeg", "image/png", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Invalid file type"));
      return;
    }
    cb(null, true);
  },
});
