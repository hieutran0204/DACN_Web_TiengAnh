const errorHandler = (err, req, res, next) => {
  console.error('🔥 Lỗi:', err);

  // Lỗi multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File quá lớn. Kích thước tối đa là 10MB'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false, 
      message: 'Trường file không hợp lệ'
    });
  }

  // Lỗi validation
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: errors.join(', ')
    });
  }

  // Lỗi MongoDB duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} đã tồn tại`
    });
  }

  // Lỗi JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token đã hết hạn'
    });
  }

  // Lỗi mặc định
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi server nội bộ'
  });
};

module.exports = errorHandler;