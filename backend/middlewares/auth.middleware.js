const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/shared/user.model');

exports.verifyToken = async (req, res, next) => {
  // Lấy token từ nhiều nguồn (header, cookie)
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
  
  if (!token) {
    // Thêm headers ngăn cache
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.status(401).redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = await User.findById(decoded.id).select('-password -refreshToken');
    
    if (!req.user) {
      // Xóa cookie token nếu user không tồn tại
      res.clearCookie('token');
      return res.status(401).redirect('/login');
    }
    
    // Thêm headers bảo mật cho các route được bảo vệ
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    next();
  } catch (error) {
    // Xóa cookie token nếu token không hợp lệ
    res.clearCookie('token');
    res.status(401).redirect('/login');
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(403).render('error/403');
  }
  
  res.setHeader('Cache-Control', 'no-store');
  next();
};

// Middleware đặc biệt để ngăn cache trang sau logout
exports.noCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};