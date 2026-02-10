// backend/socket/chatSocket.js
import jwt from "jsonwebtoken";
import ChatModel from "../models/chatModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "CHANGE_ME_PLEASE";

export default function initChatSocket(io) {
  // ✅ optional: authenticate sockets that provide token
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(); // customer can connect without token

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      socket.user = {
        user_id: payload?.sub ?? null,
        emp_id: payload?.emp_id ?? null,
        role: String(payload?.role || "").toUpperCase(),
      };
      return next();
    } catch (e) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    // =========================
    // ✅ JOIN ROOMS
    // =========================

    // join customer room
    socket.on("join_customer", ({ session_id }) => {
      if (!session_id) return;
      socket.join(`customer:${session_id}`);
    });

    // join admin room
    socket.on("join_admin", () => {
      if (!socket.user) return;
      socket.join("admin");
      socket.join(`user:${socket.user.user_id}`); // ✅ for direct staff chat
    });

    // join employee room
    socket.on("join_employee", () => {
      if (!socket.user) return;
      if (socket.user.role !== "EMPLOYEE") return;
      socket.join(`employee:${socket.user.user_id}`);
      socket.join(`user:${socket.user.user_id}`); // ✅ for direct staff chat
    });

    // =========================
    // ✅ CUSTOMER SEND
    // =========================
    socket.on("customer_message", async (payload) => {
      try {
        const { session_id, message_text, message_type = "text" } = payload || {};
        if (!session_id || !message_text) return;

        const customer = await ChatModel.ensureCustomer({ session_id });
        const convo = await ChatModel.ensureConversation(customer.id);

        const msg = await ChatModel.insertMessage({
          conversation_id: convo.id,
          sender_role: "CUSTOMER",
          sender_id: customer.id,
          message_type,
          message_text,
        });

        const convoInfo = await ChatModel.getConversationById(convo.id);
        const eventPayload = { conversation: convoInfo, message: msg };

        io.to(`customer:${session_id}`).emit("new_message", eventPayload);

        // ✅ convo may not have employee yet
        if (convoInfo?.employee_id) {
          io.to(`employee:${convoInfo.employee_id}`).emit("new_message", eventPayload);
        }

        io.to("admin").emit("new_message", eventPayload);
      } catch (err) {
        console.error("customer_message error:", err);
      }
    });

    // =========================
    // ✅ ADMIN SEND
    // =========================
    socket.on("admin_message", async (payload) => {
      try {
        if (!socket.user) return;
        if (socket.user.role !== "ADMIN") return;

        const { conversation_id, message_text, message_type = "text" } = payload || {};
        if (!conversation_id || !message_text) return;

        const convoInfo = await ChatModel.getConversationById(conversation_id);
        if (!convoInfo) return;

        const msg = await ChatModel.insertMessage({
          conversation_id,
          sender_role: "ADMIN",
          sender_id: socket.user.user_id,
          message_type,
          message_text,
        });

        const eventPayload = { conversation: convoInfo, message: msg };

        io.to("admin").emit("new_message", eventPayload);

        if (convoInfo?.employee_id) {
          io.to(`employee:${convoInfo.employee_id}`).emit("new_message", eventPayload);
        }

        if (convoInfo?.session_id) {
          io.to(`customer:${convoInfo.session_id}`).emit("new_message", eventPayload);
        }
      } catch (err) {
        console.error("admin_message error:", err);
      }
    });

    // =========================
    // ✅ EDIT MESSAGE (ADMIN/EMPLOYEE)
    // Payload: { message_id, message_text }
    socket.on("edit_message", async (payload) => {
      try {
        if (!socket.user) return;
        const role = socket.user.role;
        if (role !== "ADMIN" && role !== "EMPLOYEE") return;

        const { message_id, message_text } = payload || {};
        if (!message_id || !message_text) return;

        const msg = await ChatModel.getMessageById(message_id);
        if (!msg) return;

        const convo = await ChatModel.getConversationById(msg.conversation_id);
        if (!convo) return;

        if (role === "EMPLOYEE" && Number(convo.employee_id) !== Number(socket.user.user_id)) return;

        const updated = await ChatModel.updateMessage(message_id, message_text);
        await ChatModel.refreshConversationLast(updated.conversation_id);

        const convoInfo = await ChatModel.getConversationById(updated.conversation_id);
        const eventPayload = { conversation: convoInfo, message: updated };

        io.to("admin").emit("edited_message", eventPayload);
        if (convoInfo?.employee_id) io.to(`employee:${convoInfo.employee_id}`).emit("edited_message", eventPayload);
        if (convoInfo?.session_id) io.to(`customer:${convoInfo.session_id}`).emit("edited_message", eventPayload);
      } catch (err) {
        console.error("edit_message error:", err);
      }
    });

    // =========================
    // ✅ DELETE MESSAGE (ADMIN/EMPLOYEE)
    // Payload: { message_id }
    socket.on("delete_message", async (payload) => {
      try {
        if (!socket.user) return;
        const role = socket.user.role;
        if (role !== "ADMIN" && role !== "EMPLOYEE") return;

        const { message_id } = payload || {};
        if (!message_id) return;

        const msg = await ChatModel.getMessageById(message_id);
        if (!msg) return;

        const convo = await ChatModel.getConversationById(msg.conversation_id);
        if (!convo) return;

        if (role === "EMPLOYEE" && Number(convo.employee_id) !== Number(socket.user.user_id)) return;

        const deleted = await ChatModel.deleteMessage(message_id);
        await ChatModel.refreshConversationLast(deleted.conversation_id);

        const convoInfo = await ChatModel.getConversationById(deleted.conversation_id);
        const eventPayload = { conversation: convoInfo, message: deleted };

        io.to("admin").emit("deleted_message", eventPayload);
        if (convoInfo?.employee_id) io.to(`employee:${convoInfo.employee_id}`).emit("deleted_message", eventPayload);
        if (convoInfo?.session_id) io.to(`customer:${convoInfo.session_id}`).emit("deleted_message", eventPayload);
      } catch (err) {
        console.error("delete_message error:", err);
      }
    });

    // =========================
    // ✅ EMPLOYEE SEND
    // =========================
    socket.on("employee_message", async (payload) => {
      try {
        if (!socket.user) return;
        if (socket.user.role !== "EMPLOYEE") return;

        const { conversation_id, message_text, message_type = "text" } = payload || {};
        if (!conversation_id || !message_text) return;

        const convoInfo = await ChatModel.getConversationById(conversation_id);
        if (!convoInfo) return;

        // only assigned employee
        if (Number(convoInfo.employee_id) !== Number(socket.user.user_id)) return;

        const msg = await ChatModel.insertMessage({
          conversation_id,
          sender_role: "EMPLOYEE",
          sender_id: socket.user.user_id,
          message_type,
          message_text,
        });

        const eventPayload = { conversation: convoInfo, message: msg };

        io.to(`employee:${socket.user.user_id}`).emit("new_message", eventPayload);
        io.to("admin").emit("new_message", eventPayload);

        if (convoInfo?.session_id) {
          io.to(`customer:${convoInfo.session_id}`).emit("new_message", eventPayload);
        }
      } catch (err) {
        console.error("employee_message error:", err);
      }
    });

    // ==========================================================
    // ✅ STAFF CHAT (INTERNAL): ADMIN ↔ EMPLOYEE (NO CUSTOMER)
    // ==========================================================

    // ✅ ADMIN -> EMPLOYEE
    socket.on("admin_to_employee", async (payload) => {
      try {
        if (!socket.user) return;
        if (socket.user.role !== "ADMIN") return;

        const { to_employee_user_id, message_text, message_type = "text" } = payload || {};
        if (!to_employee_user_id || !message_text) return;

        const msg = {
          id: Date.now(),
          sender_role: "ADMIN",
          sender_id: socket.user.user_id,
          message_type,
          message_text,
          created_at: new Date().toISOString(),
        };

        // send to employee + also send back to admin (so admin UI updates immediately)
        io.to(`user:${to_employee_user_id}`).emit("staff_message", {
          peer_user_id: socket.user.user_id,
          message: msg,
        });

        io.to(`user:${socket.user.user_id}`).emit("staff_message", {
          peer_user_id: Number(to_employee_user_id),
          message: msg,
        });
      } catch (err) {
        console.error("admin_to_employee error:", err);
      }
    });

    // ✅ EMPLOYEE -> ADMIN
    socket.on("employee_to_admin", async (payload) => {
      try {
        if (!socket.user) return;
        if (socket.user.role !== "EMPLOYEE") return;

        const { to_admin_user_id, message_text, message_type = "text" } = payload || {};
        if (!to_admin_user_id || !message_text) return;

        const msg = {
          id: Date.now(),
          sender_role: "EMPLOYEE",
          sender_id: socket.user.user_id,
          message_type,
          message_text,
          created_at: new Date().toISOString(),
        };

        io.to(`user:${to_admin_user_id}`).emit("staff_message", {
          peer_user_id: socket.user.user_id,
          message: msg,
        });

        io.to(`user:${socket.user.user_id}`).emit("staff_message", {
          peer_user_id: Number(to_admin_user_id),
          message: msg,
        });
      } catch (err) {
        console.error("employee_to_admin error:", err);
      }
    });
  });
}
