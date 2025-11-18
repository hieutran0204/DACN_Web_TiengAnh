const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = "";
    if (file.fieldname === "categoryImage") subfolder = "categories";
    else if (file.fieldname === "wordImage") subfolder = "words";
    else return cb(new Error("Trường file không hợp lệ"));

    const basePath = path.join(__dirname, "../public");
    const uploadPath = path.join(basePath, "uploads", "game", subfolder);
    
    try {
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
        console.log(`📁 Đã tạo thư mục: ${uploadPath}`);
      }
      fs.accessSync(uploadPath, fs.constants.W_OK);
    } catch (err) {
      console.error(`❌ Lỗi với thư mục ${uploadPath}: ${err.message}`);
      return cb(err);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueFilename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("❌ Chỉ chấp nhận ảnh (jpg, png, webp)"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

const game_upload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    
    if (req.file) {
      req.body.image = `/uploads/game/${req.file.fieldname === 'categoryImage' ? 'categories' : 'words'}/${req.file.filename}`;
    } else if (req.body.image && req.body.image.trim() !== '') {
      // Giữ nguyên image URL cũ
      console.log(`📝 Giữ URL image cũ: ${req.body.image}`);
    }
    
    next();
  });
};

module.exports = game_upload;