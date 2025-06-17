// // // // // const multer = require("multer");
// // // // // const path = require("path");

// // // // // // Cấu hình lưu file
// // // // // const storage = multer.diskStorage({
// // // // //   destination: (req, file, cb) => {
// // // // //     cb(null, "uploads/"); // nơi lưu file
// // // // //   },
// // // // //   filename: (req, file, cb) => {
// // // // //     const ext = path.extname(file.originalname);
// // // // //     const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
// // // // //     cb(null, uniqueName);
// // // // //   },
// // // // // });

// // // // // // Chỉ cho phép audio/mp3 & image
// // // // // const fileFilter = (req, file, cb) => {
// // // // //   const allowedTypes = ["audio/mpeg", "audio/mp3", "image/jpeg", "image/png"];
// // // // //   if (allowedTypes.includes(file.mimetype)) {
// // // // //     cb(null, true);
// // // // //   } else {
// // // // //     cb(new Error("Chỉ cho phép file âm thanh (.mp3) hoặc ảnh (.jpg/.png)"));
// // // // //   }
// // // // // };

// // // // // // Multer instance cho nhiều field
// // // // // const upload = multer({
// // // // //   storage,
// // // // //   limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
// // // // //   fileFilter,
// // // // // });

// // // // // // Tải lên 1 audio + 1 image
// // // // // const listening_upload = upload.fields([
// // // // //   { name: "audio", maxCount: 1 },
// // // // //   { name: "image", maxCount: 1 },
// // // // // ]);

// // // // // module.exports = listening_upload;

// // // // const multer = require("multer");
// // // // const path = require("path");
// // // // const fs = require("fs");

// // // // const ensureDirectoryExists = (directory) => {
// // // //   if (!fs.existsSync(directory)) {
// // // //     fs.mkdirSync(directory, { recursive: true });
// // // //     console.log(`📁 Tạo thư mục: ${directory}`);
// // // //   }
// // // // };

// // // // const storage = multer.diskStorage({
// // // //   destination: (req, file, cb) => {
// // // //     let subfolder = "";
// // // //     if (file.fieldname === "audio") {
// // // //       subfolder = "audio";
// // // //     } else if (file.fieldname === "image") {
// // // //       subfolder = "image";
// // // //     } else {
// // // //       return cb(new Error("Trường file không hợp lệ"));
// // // //     }

// // // //     const fullPath = path.join(
// // // //       __dirname,
// // // //       "..",
// // // //       "public",
// // // //       "uploads",
// // // //       "listening",
// // // //       subfolder
// // // //     );
// // // //     ensureDirectoryExists(fullPath);
// // // //     cb(null, fullPath);
// // // //   },

// // // //   filename: (req, file, cb) => {
// // // //     const ext = path.extname(file.originalname).toLowerCase();
// // // //     const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
// // // //     cb(null, filename);
// // // //   },
// // // // });

// // // // const fileFilter = (req, file, cb) => {
// // // //   const allowed = [
// // // //     "audio/mpeg",
// // // //     "audio/mp3",
// // // //     "image/jpeg",
// // // //     "image/png",
// // // //     "image/webp",
// // // //   ];
// // // //   if (allowed.includes(file.mimetype)) {
// // // //     cb(null, true);
// // // //   } else {
// // // //     cb(new Error("❌ File không hợp lệ"));
// // // //   }
// // // // };

// // // // const upload = multer({
// // // //   storage,
// // // //   limits: { fileSize: 20 * 1024 * 1024 },
// // // //   fileFilter,
// // // // });

// // // // const listening_upload = upload.fields([
// // // //   { name: "audio", maxCount: 1 },
// // // //   { name: "image", maxCount: 1 },
// // // // ]);

// // // // module.exports = listening_upload;
// // // // const multer = require("multer");
// // // // const path = require("path");
// // // // const fs = require("fs"); // Import fs

// // // // const storage = multer.diskStorage({
// // // //   destination: (req, file, cb) => {
// // // //     let uploadPath;
// // // //     if (file.fieldname === "audio") {
// // // //       uploadPath = path.join(__dirname, "../../public/uploads/listening/audio");
// // // //     } else if (file.fieldname === "image") {
// // // //       uploadPath = path.join(__dirname, "../../public/uploads/listening/image");
// // // //     }
// // // //     // Đảm bảo thư mục tồn tại
// // // //     if (!fs.existsSync(uploadPath)) {
// // // //       fs.mkdirSync(uploadPath, { recursive: true });
// // // //       console.log(`Đã tạo thư mục: ${uploadPath}`); // Debug
// // // //     }
// // // //     cb(null, uploadPath);
// // // //   },
// // // //   filename: (req, file, cb) => {
// // // //     const uniqueFilename = `${Date.now()}-${file.originalname}`;
// // // //     console.log(`Đã đặt tên file: ${uniqueFilename}`); // Debug
// // // //     cb(null, uniqueFilename);
// // // //   },
// // // // });

// // // // const fileFilter = (req, file, cb) => {
// // // //   console.log(
// // // //     `Kiểm tra file: ${file.originalname}, mimetype: ${file.mimetype}`
// // // //   ); // Debug
// // // //   if (file.fieldname === "audio") {
// // // //     if (
// // // //       file.mimetype === "audio/mpeg" || // mp3
// // // //       file.mimetype === "audio/wav" || // wav
// // // //       file.mimetype === "audio/mp4" // mp4 (nếu cần)
// // // //     ) {
// // // //       cb(null, true);
// // // //     } else {
// // // //       cb(new Error("Chỉ chấp nhận file audio (mp3, wav, mp4)"), false);
// // // //     }
// // // //   } else if (file.fieldname === "image") {
// // // //     if (file.mimetype.startsWith("image/")) {
// // // //       cb(null, true);
// // // //     } else {
// // // //       cb(new Error("Chỉ chấp nhận file hình ảnh"), false);
// // // //     }
// // // //   } else {
// // // //     cb(new Error("Trường file không hợp lệ"), false);
// // // //   }
// // // // };

// // // // const upload = multer({
// // // //   storage: storage,
// // // //   fileFilter: fileFilter,
// // // //   limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10MB
// // // // }).fields([{ name: "audio" }, { name: "image" }]);

// // // // module.exports = upload;
// // // // const multer = require("multer");
// // // // const path = require("path");
// // // // const fs = require("fs");

// // // // const storage = multer.diskStorage({
// // // //   destination: (req, file, cb) => {
// // // //     let uploadPath;
// // // //     if (file.fieldname === "audio") {
// // // //       uploadPath = path.join(__dirname, "../../public/uploads/listening/audio");
// // // //     } else if (file.fieldname === "image") {
// // // //       uploadPath = path.join(__dirname, "../../public/uploads/listening/image");
// // // //     }
// // // //     // Đảm bảo thư mục tồn tại
// // // //     if (!fs.existsSync(uploadPath)) {
// // // //       fs.mkdirSync(uploadPath, { recursive: true });
// // // //       console.log(`Đã tạo thư mục: ${uploadPath}`);
// // // //     }
// // // //     // Kiểm tra quyền ghi
// // // //     fs.access(uploadPath, fs.constants.W_OK, (err) => {
// // // //       if (err) {
// // // //         console.error(`Không có quyền ghi vào ${uploadPath}:`, err);
// // // //         return cb(err);
// // // //       }
// // // //       cb(null, uploadPath);
// // // //     });
// // // //   },
// // // //   filename: (req, file, cb) => {
// // // //     const uniqueFilename = `${Date.now()}-${file.originalname}`;
// // // //     console.log(`Đặt tên file: ${uniqueFilename}`);
// // // //     // Kiểm tra file đã tồn tại chưa
// // // //     const filePath = path.join(
// // // //       __dirname,
// // // //       "../../public/uploads/listening",
// // // //       file.fieldname,
// // // //       uniqueFilename
// // // //     );
// // // //     fs.access(filePath, fs.constants.F_OK, (err) => {
// // // //       if (!err) {
// // // //         console.warn(`File ${uniqueFilename} đã tồn tại, ghi đè`);
// // // //       }
// // // //       cb(null, uniqueFilename);
// // // //     });
// // // //   },
// // // // });

// // // // const fileFilter = (req, file, cb) => {
// // // //   console.log(
// // // //     `Kiểm tra file: ${file.originalname}, mimetype: ${file.mimetype}`
// // // //   );
// // // //   if (file.fieldname === "audio") {
// // // //     if (
// // // //       file.mimetype === "audio/mpeg" || // mp3
// // // //       file.mimetype === "audio/wav" || // wav
// // // //       file.mimetype === "audio/mp4" // mp4 (nếu cần)
// // // //     ) {
// // // //       cb(null, true);
// // // //     } else {
// // // //       cb(new Error("Chỉ chấp nhận file audio (mp3, wav, mp4)"), false);
// // // //     }
// // // //   } else if (file.fieldname === "image") {
// // // //     if (file.mimetype.startsWith("image/")) {
// // // //       cb(null, true);
// // // //     } else {
// // // //       cb(new Error("Chỉ chấp nhận file hình ảnh"), false);
// // // //     }
// // // //   } else {
// // // //     cb(new Error("Trường file không hợp lệ"), false);
// // // //   }
// // // // };

// // // // const upload = multer({
// // // //   storage: storage,
// // // //   fileFilter: fileFilter,
// // // //   limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10MB
// // // // }).fields([{ name: "audio" }, { name: "image" }]);

// // // // module.exports = upload;
// // // const multer = require("multer");
// // // const path = require("path");
// // // const fs = require("fs");

// // // const storage = multer.diskStorage({
// // //   destination: (req, file, cb) => {
// // //     let subfolder = "";
// // //     if (file.fieldname === "audio") subfolder = "audio";
// // //     else if (file.fieldname === "image") subfolder = "image";
// // //     else return cb(new Error("Trường file không hợp lệ"));

// // //     const uploadPath = path.join(
// // //       __dirname,
// // //       "../../public/uploads/listening",
// // //       subfolder
// // //     );
// // //     // Đảm bảo thư mục tồn tại
// // //     if (!fs.existsSync(uploadPath)) {
// // //       fs.mkdirSync(uploadPath, { recursive: true });
// // //       console.log(`📁 Đã tạo thư mục: ${uploadPath}`);
// // //     }
// // //     cb(null, uploadPath);
// // //   },
// // //   filename: (req, file, cb) => {
// // //     const ext = path.extname(file.originalname).toLowerCase();
// // //     const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
// // //     console.log(`📄 Đặt tên file: ${uniqueFilename}`);
// // //     cb(null, uniqueFilename);
// // //   },
// // // });

// // // const fileFilter = (req, file, cb) => {
// // //   console.log(
// // //     `📋 Kiểm tra file: ${file.originalname}, mimetype: ${file.mimetype}`
// // //   );
// // //   const allowedTypes = {
// // //     audio: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/mp4"],
// // //     image: ["image/jpeg", "image/png", "image/webp"],
// // //   };
// // //   if (
// // //     file.fieldname === "audio" &&
// // //     allowedTypes.audio.includes(file.mimetype)
// // //   ) {
// // //     cb(null, true);
// // //   } else if (
// // //     file.fieldname === "image" &&
// // //     allowedTypes.image.includes(file.mimetype)
// // //   ) {
// // //     cb(null, true);
// // //   } else {
// // //     cb(
// // //       new Error(
// // //         "❌ File không hợp lệ: Chỉ chấp nhận audio (mp3, wav, mp4) hoặc ảnh (jpg, png, webp)"
// // //       )
// // //     );
// // //   }
// // // };

// // // const upload = multer({
// // //   storage,
// // //   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
// // //   fileFilter,
// // // });

// // // const listening_upload = upload.fields([
// // //   { name: "audio", maxCount: 1 },
// // //   { name: "image", maxCount: 1 },
// // // ]);

// // // module.exports = listening_upload;
// // const multer = require("multer");
// // const path = require("path");
// // const fs = require("fs");

// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     let subfolder = "";
// //     if (file.fieldname === "audio") subfolder = "audio";
// //     else if (file.fieldname === "image") subfolder = "image";
// //     else return cb(new Error("Trường file không hợp lệ"));

// //     const uploadPath = path.join(
// //       __dirname,
// //       "../../public/uploads/listening",
// //       subfolder
// //     );
// //     // Đảm bảo thư mục tồn tại
// //     if (!fs.existsSync(uploadPath)) {
// //       fs.mkdirSync(uploadPath, { recursive: true });
// //       console.log(`📁 Đã tạo thư mục: ${uploadPath}`);
// //     }
// //     cb(null, uploadPath);
// //   },
// //   filename: (req, file, cb) => {
// //     const ext = path.extname(file.originalname).toLowerCase();
// //     const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
// //     console.log(`📄 Đặt tên file: ${uniqueFilename}`);
// //     cb(null, uniqueFilename);
// //   },
// // });

// // const fileFilter = (req, file, cb) => {
// //   console.log(
// //     `📋 Kiểm tra file: ${file.originalname}, mimetype: ${file.mimetype}`
// //   );
// //   const allowedTypes = {
// //     audio: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/mp4"],
// //     image: ["image/jpeg", "image/png", "image/webp"],
// //   };
// //   if (
// //     file.fieldname === "audio" &&
// //     allowedTypes.audio.includes(file.mimetype)
// //   ) {
// //     cb(null, true);
// //   } else if (
// //     file.fieldname === "image" &&
// //     allowedTypes.image.includes(file.mimetype)
// //   ) {
// //     cb(null, true);
// //   } else {
// //     cb(
// //       new Error(
// //         "❌ File không hợp lệ: Chỉ chấp nhận audio (mp3, wav, mp4) hoặc ảnh (jpg, png, webp)"
// //       )
// //     );
// //   }
// // };

// // const upload = multer({
// //   storage,
// //   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
// //   fileFilter,
// // });

// // const listening_upload = upload.fields([
// //   { name: "audio", maxCount: 1 },
// //   { name: "image", maxCount: 1 },
// // ]);

// // module.exports = listening_upload;
// // const multer = require("multer");
// // const path = require("path");
// // const fs = require("fs");

// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     let subfolder = "";
// //     if (file.fieldname === "audio") subfolder = "audio";
// //     else if (file.fieldname === "image") subfolder = "image";
// //     else return cb(new Error("Trường file không hợp lệ"));

// //     const uploadPath = path.join(
// //       __dirname,
// //       "../public/uploads/listening",
// //       subfolder
// //     );
// //     if (!fs.existsSync(uploadPath)) {
// //       fs.mkdirSync(uploadPath, { recursive: true });
// //       console.log(`📁 Đã tạo thư mục: ${uploadPath}`);
// //     }
// //     cb(null, uploadPath);
// //   },
// //   filename: (req, file, cb) => {
// //     const ext = path.extname(file.originalname).toLowerCase();
// //     const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
// //     console.log(`📄 Đặt tên file: ${uniqueFilename}`);
// //     cb(null, uniqueFilename);
// //   },
// // });

// // const fileFilter = (req, file, cb) => {
// //   console.log(
// //     `📋 Kiểm tra file: ${file.originalname}, mimetype: ${file.mimetype}`
// //   );
// //   const allowedTypes = {
// //     audio: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/mp4"],
// //     image: ["image/jpeg", "image/png", "image/webp"],
// //   };
// //   if (
// //     file.fieldname === "audio" &&
// //     allowedTypes.audio.includes(file.mimetype)
// //   ) {
// //     cb(null, true);
// //   } else if (
// //     file.fieldname === "image" &&
// //     allowedTypes.image.includes(file.mimetype)
// //   ) {
// //     cb(null, true);
// //   } else {
// //     cb(
// //       new Error(
// //         "❌ File không hợp lệ: Chỉ chấp nhận audio (mp3, wav, mp4) hoặc ảnh (jpg, png, webp)"
// //       )
// //     );
// //   }
// // };

// // const upload = multer({
// //   storage,
// //   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
// //   fileFilter,
// // });

// // const listening_upload = upload.fields([
// //   { name: "audio", maxCount: 1 },
// //   { name: "image", maxCount: 1 },
// // ]);

// // module.exports = listening_upload;
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     let subfolder = "";
//     if (file.fieldname === "audio") subfolder = "audio";
//     else if (file.fieldname === "image") subfolder = "image";
//     else return cb(new Error("Trường file không hợp lệ"));

//     const basePath = path.join(__dirname, "../public");
//     const uploadPath = path.join(basePath, "uploads", "listening", subfolder);
//     console.log(`📂 Base path: ${basePath}`); // Debug base path
//     console.log(`📂 Đường dẫn đích: ${uploadPath}`); // Debug upload path

//     try {
//       if (!fs.existsSync(uploadPath)) {
//         fs.mkdirSync(uploadPath, { recursive: true });
//         console.log(`📁 Đã tạo thư mục: ${uploadPath}`);
//       }
//       // Kiểm tra quyền ghi
//       fs.accessSync(uploadPath, fs.constants.W_OK);
//       console.log(`✅ Thư mục ${uploadPath} có quyền ghi`);
//     } catch (err) {
//       console.error(`❌ Lỗi với thư mục ${uploadPath}: ${err.message}`);
//       return cb(err);
//     }
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();
//     const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
//     console.log(
//       `📄 Đặt tên file: ${uniqueFilename} (gốc: ${file.originalname})`
//     );
//     cb(null, uniqueFilename);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   console.log(
//     `📋 Kiểm tra file: ${file.originalname}, mimetype: ${file.mimetype}`
//   );
//   const allowedTypes = {
//     audio: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/mp4"],
//     image: ["image/jpeg", "image/png", "image/webp"],
//   };
//   if (
//     file.fieldname === "audio" &&
//     allowedTypes.audio.includes(file.mimetype)
//   ) {
//     cb(null, true);
//   } else if (
//     file.fieldname === "image" &&
//     allowedTypes.image.includes(file.mimetype)
//   ) {
//     cb(null, true);
//   } else {
//     console.error(
//       `❌ File ${file.originalname} không hợp lệ: ${file.mimetype}`
//     );
//     cb(
//       new Error(
//         "❌ File không hợp lệ: Chỉ chấp nhận audio (mp3, wav, mp4) hoặc ảnh (jpg, png, webp)"
//       )
//     );
//   }
// };

// const upload = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
//   fileFilter,
// });

// const listening_upload = upload.fields([
//   { name: "audio", maxCount: 1 },
//   { name: "image", maxCount: 1 },
// ]);

// module.exports = listening_upload;
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
