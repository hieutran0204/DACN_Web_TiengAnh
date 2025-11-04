const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname !== "image") {
      return cb(new Error("Trường file không hợp lệ"));
    }

    const basePath = path.join(__dirname, "../public");
    const uploadPath = path.join(basePath, "uploads", "writing", "image");
    console.log(`📂 Base path: ${basePath}`);
    console.log(`📂 Đường dẫn đích: ${uploadPath}`);

    try {
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
        console.log(`📁 Đã tạo thư mục: ${uploadPath}`);
      }
      fs.accessSync(uploadPath, fs.constants.W_OK);
      console.log(`✅ Thư mục ${uploadPath} có quyền ghi`);
    } catch (err) {
      console.error(`❌ Lỗi với thư mục ${uploadPath}: ${err.message}`);
      if (err.code === "EACCES") {
        try {
          fs.chmodSync(uploadPath, 0o775);
          console.log(`⚠️ Đã thử cấp quyền ghi cho ${uploadPath}`);
        } catch (chmodErr) {
          console.error(`❌ Lỗi cấp quyền: ${chmodErr.message}`);
          return cb(new Error(`Không có quyền ghi vào ${uploadPath}`));
        }
      }
      return cb(err);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    console.log(
      `📄 Đặt tên file: ${uniqueFilename} (gốc: ${file.originalname})`
    );
    cb(null, uniqueFilename);
  },
});

const fileFilter = (req, file, cb) => {
  console.log(
    `📋 Kiểm tra file: ${file.originalname}, mimetype: ${file.mimetype}`
  );
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (file.fieldname === "image" && allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.error(
      `❌ File ${file.originalname} không hợp lệ: ${file.mimetype}`
    );
    cb(new Error("❌ File không hợp lệ: Chỉ chấp nhận ảnh (jpg, png, webp)"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

const writing_upload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error(`❌ Lỗi upload: ${err.message}`);
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file && req.body.image) {
      console.log(`📝 Giữ URL image cũ: ${req.body.image}`);
    }
    if (req.file) {
      req.body.image = `/uploads/writing/image/${req.file.filename}`;
      console.log(`📤 Đã upload file mới: ${req.body.image}`);
    }
    console.log(`📦 Dữ liệu gửi tiếp:`, req.body);
    next();
  });
};

module.exports = writing_upload;
