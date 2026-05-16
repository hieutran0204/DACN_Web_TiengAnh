const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Tạo thư mục nếu chưa tồn tại
const createUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Cấu hình storage cho news images
const newsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../public/uploads/news/images");
    createUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "news-" + uniqueSuffix + ext);
  }
});

// File filter - chỉ cho phép ảnh
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép upload ảnh (jpeg, jpg, png, gif, webp)"));
  }
};

// Upload middleware cho news
const uploadNewsImage = multer({
  storage: newsStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: imageFilter
}).single("image"); // field name là "image"

// Xóa file ảnh
const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Cấu hình storage cho audio
const audioStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../public/uploads/speaking/audio");
    createUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "audio-" + uniqueSuffix + ext);
  }
});

// Audio filter
const audioFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream') {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép upload file âm thanh"));
  }
};

// Upload middleware cho audio
const uploadAudio = multer({
  storage: audioStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: audioFilter
}).single("audio"); // field name là "audio"

module.exports = {
  uploadNewsImage,
  uploadAudio,
  deleteFile
};