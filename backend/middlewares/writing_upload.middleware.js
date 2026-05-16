const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    // Check removed to allow upload.any() to work with any field name
    
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
    `📋 Kiểm tra file: ${file.originalname}, mimetype: ${file.mimetype}, field: ${file.fieldname}`
  );
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.error(
      `❌ File ${file.originalname} không hợp lệ: ${file.mimetype}`
    );
    cb(new Error("File không phải là ảnh hợp lệ (chỉ chấp nhận jpg, png, webp)"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

const writing_upload = (req, res, next) => {
  console.log("🔥 [DEBUG] ENTERING WRITING UPLOAD MIDDLEWARE (UPLOAD.ANY) 🔥");
  // Use upload.any() to avoid "Unexpected field" errors caused by name mismatches
  // We will manually filter and collect files in the callback
  const uploadMiddleware = upload.any();

  uploadMiddleware(req, res, (err) => {
    if (err) {
      console.error(`❌ [DEBUG] Lỗi upload chi tiết:`, err);
      console.error(`❌ [DEBUG] Error Code:`, err.code);
      console.error(`❌ [DEBUG] Error Field:`, err.field);
      return res.status(400).json({ success: false, message: `Upload Error: ${err.message} (${err.code})` });
    }

    // Collect all uploaded files regardless of field name
    let newUrls = [];
    if (req.files && req.files.length > 0) {
      newUrls = req.files.map((f) => `/uploads/writing/image/${f.filename}`);
      console.log(`📤 Đã upload ${req.files.length} file (bất kể field name):`, newUrls);
    }

    // Initialize req.body.images
    if (!req.body.images) req.body.images = [];
    else if (!Array.isArray(req.body.images)) req.body.images = [req.body.images];

    // Append new URLs
    req.body.images.push(...newUrls);

    // Also populate legacy 'image' field if empty and we have images
    if (!req.body.image && newUrls.length > 0) {
        req.body.image = newUrls[0];
    }

    console.log(`📦 Dữ liệu gửi tiếp:`, req.body);
    next();
  });
};

module.exports = writing_upload;
