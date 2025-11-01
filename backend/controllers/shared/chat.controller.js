const Message = require("../../models/shared/message.model");
const User = require("../../models/shared/user.model");

const ChatController = {
  // Hiển thị trang chat cho client
  showClientChat: async (req, res) => {
    try {
      const user = req.user;
      const channelID = `client_${user.fullname.replace(/[^a-zA-Z0-9]/g, "_")}_${user.username}`;
      // Lấy lịch sử tin nhắn
      const messages = await Message.find({ channelID })
        .sort({ timestamp: 1 })
        .limit(50);
      res.render("client/pages/chat", {
        user,
        channelID,
        messages,
        title: "Chat với Admin",
      });
    } catch (error) {
      console.error("Lỗi khi hiển thị chat client:", error);
      res.render("client/pages/chat", {
        user: req.user,
        channelID: null,
        messages: [],
        error: "Không thể tải lịch sử chat",
        title: "Chat với Admin",
      });
    }
  },

  // Hiển thị trang chat cho admin
  showAdminChat: async (req, res) => {
    try {
      const user = req.user;
      // Lấy danh sách client để admin chọn
      const clients = await User.find({ role: "user" })
        .select("fullname username")
        .lean();
      const clientList = clients.map((client) => ({
        channelID: `client_${client.fullname.replace(/[^a-zA-Z0-9]/g, "_")}_${client.username}`,
        fullname: client.fullname,
        username: client.username,
      }));

      // Lấy lịch sử tin nhắn cho kênh đầu tiên (nếu có)
      const channelID =
        req.query.channelID ||
        (clientList.length > 0 ? clientList[0].channelID : null);
      let messages = [];
      if (channelID) {
        messages = await Message.find({ channelID })
          .sort({ timestamp: 1 })
          .limit(50);
      }

      res.render("admin/pages/TOEIC/admin_chat", {
        user,
        clientList,
        channelID,
        messages,
        title: "Quản lý Chat",
      });
    } catch (error) {
      console.error("Lỗi khi hiển thị chat admin:", error);
      res.render("admin/pages/TOEIC/admin_chat", {
        user: req.user,
        clientList: [],
        channelID: null,
        messages: [],
        error: "Không thể tải danh sách client hoặc lịch sử chat",
        title: "Quản lý Chat",
      });
    }
  },
};

module.exports = ChatController;
