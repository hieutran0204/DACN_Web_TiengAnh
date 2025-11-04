const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = "";
    if (file.fieldname === "audio") subfolder = "audio";
    else if (file.fieldname === "image") subfolder = "image";
    else return cb(new Error("Trường file không hợp lệ"));

    const basePath = path.join(__dirname, "../public");
    const uploadPath = path.join(basePath, "uploads", "listening", subfolder);
    console.log(`📂 Base path: ${basePath}`);
    console.log(`📂 Đường dẫn đích: ${uploadPath}`);

    try {
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
        console.log(`📁 Đã tạo thư mục: ${uploadPath}`);
      }
      // Kiểm tra quyền ghi và cố gắng sửa nếu cần
      fs.accessSync(uploadPath, fs.constants.W_OK);
      console.log(`✅ Thư mục ${uploadPath} có quyền ghi`);
    } catch (err) {
      console.error(`❌ Lỗi với thư mục ${uploadPath}: ${err.message}`);
      // Thử cấp quyền ghi (chỉ trên hệ thống Unix-based)
      if (err.code === "EACCES") {
        fs.chmodSync(uploadPath, 0o775);
        console.log(`⚠️ Đã thử cấp quyền ghi cho ${uploadPath}`);
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
  const allowedTypes = {
    audio: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/mp4"],
    image: ["image/jpeg", "image/png", "image/webp"],
  };
  if (
    file.fieldname === "audio" &&
    allowedTypes.audio.includes(file.mimetype)
  ) {
    cb(null, true);
  } else if (
    file.fieldname === "image" &&
    allowedTypes.image.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    console.error(
      `❌ File ${file.originalname} không hợp lệ: ${file.mimetype}`
    );
    cb(
      new Error(
        "❌ File không hợp lệ: Chỉ chấp nhận audio (mp3, wav, mp4) hoặc ảnh (jpg, png, webp)"
      )
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

// Middleware xử lý upload
const listening_upload = (req, res, next) => {
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      console.error(`❌ Lỗi upload: ${err.message}`);
      return res.status(400).json({ success: false, message: err.message });
    }
    // Nếu không có file audio mới, giữ URL cũ từ req.body
    if (!req.files?.audio && req.body.audio) {
      req.body.audio = req.body.audio; // Giữ nguyên URL cũ
      console.log(`📝 Giữ URL audio cũ: ${req.body.audio}`);
    }
    // Nếu không có file image mới, giữ URL cũ từ req.body
    if (!req.files?.image && req.body.image) {
      req.body.image = req.body.image; // Giữ nguyên URL cũ
      console.log(`📝 Giữ URL image cũ: ${req.body.image}`);
    }
    // Cập nhật req.files với đường dẫn đầy đủ
    if (req.files?.audio) {
      req.body.audio = `/uploads/listening/audio/${req.files.audio[0].filename}`;
    }
    if (req.files?.image) {
      req.body.image = `/uploads/listening/image/${req.files.image[0].filename}`;
    }
    console.log(`📦 Dữ liệu gửi tiếp:`, req.body);
    next();
  });
};

module.exports = listening_upload;
