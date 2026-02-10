import ChatModel from "../models/chatModel.js";

export default class ChatController {
  // POST /api/chat/customer/init
  static async customerInit(req, res) {
    try {
      const { session_id, phone, first_name, last_name } = req.body || {};
      if (!session_id) {
        return res
          .status(400)
          .json({ success: false, message: "session_id is required" });
      }

      const customer = await ChatModel.ensureCustomer({
        session_id,
        phone,
        first_name,
        last_name,
      });
      const convo = await ChatModel.ensureConversation(customer.id);
      const convoInfo = await ChatModel.getConversationById(convo.id);

      return res.json({ success: true, data: convoInfo });
    } catch (err) {
      console.error("customerInit error:", err);
      return res
        .status(500)
        .json({ success: false, message: err.message || "Server error" });
    }
  }

  // GET /api/chat/customer/conversation?session_id=xxx
  static async customerConversation(req, res) {
    try {
      const session_id = String(req.query.session_id || "");
      if (!session_id)
        return res
          .status(400)
          .json({ success: false, message: "session_id is required" });

      const convo = await ChatModel.getCustomerConversation(session_id);
      return res.json({ success: true, data: convo });
    } catch (err) {
      console.error("customerConversation error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Server error" });
    }
  }

  // GET /api/chat/customer/messages/:conversationId?session_id=xxx
  static async customerMessages(req, res) {
    try {
      const conversationId = Number(req.params.conversationId);
      const session_id = String(req.query.session_id || "");

      if (!conversationId || !session_id) {
        return res.status(400).json({
          success: false,
          message: "conversationId + session_id required",
        });
      }

      const convo = await ChatModel.getConversationById(conversationId);
      if (!convo || convo.session_id !== session_id) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const msgs = await ChatModel.getMessages(conversationId, 200, 0);
      return res.json({ success: true, data: msgs });
    } catch (err) {
      console.error("customerMessages error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Server error" });
    }
  }

  // GET /api/chat/conversations (ADMIN/EMPLOYEE)
  static async listConversations(req, res) {
    try {
      const limit = Number(req.query.limit || 50);
      const offset = Number(req.query.offset || 0);

      const role = String(req.user?.role || "").toUpperCase();
      const employee_id = req.user?.user_id;

      const data = await ChatModel.listConversations({
        role,
        employee_id,
        limit,
        offset,
      });
      return res.json({ success: true, data });
    } catch (err) {
      console.error("listConversations error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Server error" });
    }
  }

  // GET /api/chat/messages/:conversationId (ADMIN/EMPLOYEE)
  static async getMessages(req, res) {
    try {
      const conversationId = Number(req.params.conversationId);
      if (!conversationId)
        return res
          .status(400)
          .json({ success: false, message: "conversationId required" });

      const role = String(req.user?.role || "").toUpperCase();
      const employee_id = req.user?.user_id;

      const convo = await ChatModel.getConversationById(conversationId);
      if (!convo)
        return res
          .status(404)
          .json({ success: false, message: "Conversation not found" });

      if (role === "EMPLOYEE" && Number(convo.employee_id) !== Number(employee_id)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const limit = Number(req.query.limit || 200);
      const offset = Number(req.query.offset || 0);

      const msgs = await ChatModel.getMessages(conversationId, limit, offset);
      return res.json({ success: true, data: msgs });
    } catch (err) {
      console.error("getMessages error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Server error" });
    }
  }

  /**
   * ✅ POST /api/chat/upload (ADMIN/EMPLOYEE)
   * form-data: file + conversation_id
   *
   * ✅ FIX: upload ONLY (do NOT insert message here)
   * message insertion should happen ONLY via socket "admin_message"
   */
  static async uploadImage(req, res) {
    try {
      const conversation_id = Number(req.body.conversation_id);
      if (!conversation_id) {
        return res
          .status(400)
          .json({ success: false, message: "conversation_id required" });
      }
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "file required" });
      }

      // Optional: validate permission (employee can only upload to their convo)
      const role = String(req.user?.role || "").toUpperCase();
      const employee_id = req.user?.user_id;

      const convo = await ChatModel.getConversationById(conversation_id);
      if (!convo)
        return res
          .status(404)
          .json({ success: false, message: "Conversation not found" });

      if (role === "EMPLOYEE" && Number(convo.employee_id) !== Number(employee_id)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const imageUrl = `/chatimage/${req.file.filename}`;


      // ✅ return only URL (frontend will emit socket to insert message)
      return res.json({ success: true, data: { image_url: imageUrl } });
    } catch (err) {
      console.error("uploadImage error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Server error",
      });
    }
  }

  /**
   * ✅ POST /api/chat/customer/upload (CUSTOMER)
   * form-data: file + session_id
   *
   * ✅ FIX: upload ONLY (do NOT insert message here)
   * message insertion should happen ONLY via socket "customer_message"
   */
  static async customerUploadImage(req, res) {
    try {
      const session_id = String(req.body.session_id || req.query.session_id || "");
      if (!session_id)
        return res
          .status(400)
          .json({ success: false, message: "session_id required" });
      if (!req.file)
        return res
          .status(400)
          .json({ success: false, message: "file required" });

      // Ensure conversation exists (so frontend can emit with session_id)
      const customer = await ChatModel.ensureCustomer({ session_id });
      const convo = await ChatModel.ensureConversation(customer.id);

      const imageUrl = `/chatimage/${req.file.filename}`;

      // ✅ return only URL (frontend will emit socket to insert message)
      return res.json({
        success: true,
        data: { conversation_id: convo.id, image_url: imageUrl },
      });
    } catch (err) {
      console.error("customerUploadImage error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Server error",
      });
    }
  }

  // =========================
  // ✅ DELETE ENDPOINTS
  // =========================

  // ✅ DELETE /api/chat/messages/:messageId (ADMIN/EMPLOYEE)
  static async deleteMessage(req, res) {
    try {
      const messageId = Number(req.params.messageId);
      if (!messageId) {
        return res
          .status(400)
          .json({ success: false, message: "messageId required" });
      }

      const role = String(req.user?.role || "").toUpperCase();
      const employee_id = req.user?.user_id;

      const msg = await ChatModel.getMessageById(messageId);
      if (!msg) {
        return res
          .status(404)
          .json({ success: false, message: "Message not found" });
      }

      const convo = await ChatModel.getConversationById(msg.conversation_id);
      if (!convo) {
        return res
          .status(404)
          .json({ success: false, message: "Conversation not found" });
      }

      // EMPLOYEE can delete only their own conversation messages
      if (role === "EMPLOYEE" && Number(convo.employee_id) !== Number(employee_id)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const deleted = await ChatModel.deleteMessage(messageId);
      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Message not found" });
      }

      // refresh conversation last message
      await ChatModel.refreshConversationLast(deleted.conversation_id);

      return res.json({ success: true, data: deleted });
    } catch (err) {
      console.error("deleteMessage error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Server error",
      });
    }
  }

  // ✅ DELETE /api/chat/conversations/:conversationId (ADMIN/EMPLOYEE)
  static async deleteConversation(req, res) {
    try {
      const conversationId = Number(req.params.conversationId);
      if (!conversationId) {
        return res
          .status(400)
          .json({ success: false, message: "conversationId required" });
      }

      const role = String(req.user?.role || "").toUpperCase();
      const employee_id = req.user?.user_id;

      const convo = await ChatModel.getConversationById(conversationId);
      if (!convo) {
        return res
          .status(404)
          .json({ success: false, message: "Conversation not found" });
      }

      if (role === "EMPLOYEE" && Number(convo.employee_id) !== Number(employee_id)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const deleted = await ChatModel.deleteConversation(conversationId);
      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Conversation not found" });
      }

      return res.json({ success: true, data: deleted });
    } catch (err) {
      console.error("deleteConversation error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Server error",
      });
    }
  }
}
