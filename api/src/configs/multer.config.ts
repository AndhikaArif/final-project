import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  fileFilter(_, file, cb) {
    const allowed = ["image/jpeg", "image/png", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Invalid file type"));
    }
    cb(null, true);
  },
});
