const authService = require("../services/auth/auth.service");

class AuthController {
  async login(req, res) {
    try {
      console.log("Received Login Data:", req.body);
      if (!req.body || Object.keys(req.body).length === 0) {
        return res
          .status(400)
          .json({ error: "Request body is missing or empty" });
      }
      const { username, password } = req.body;
      if (!username || !password) {
        return res
          .status(400)
          .json({ error: "Username và mật khẩu không được để trống" });
      }

      const result = await authService.login({ username, password });
      res.json(result);
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }

  async register(req, res) {
    try {
      console.log("Received Register Data:", req.body);
      if (!req.body || Object.keys(req.body).length === 0) {
        return res
          .status(400)
          .json({ error: "Request body is missing or empty" });
      }
      const { username, email, password, name } = req.body;
      if (!username || !email || !password || !name) {
        return res.status(400).json({
          error: "Username, email, mật khẩu và tên không được để trống",
        });
      }

      const user = await authService.register({
        username,
        email,
        password,
        name,
      });
      res.status(201).json({ message: "Đăng ký thành công", user });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async logout(req, res) {
    try {
      const token = req.headers["authorization"]?.split(" ")[1];
      if (!token) {
        return res.status(400).json({ error: "Token không được cung cấp" });
      }
      const result = await authService.logout(token);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new AuthController();
