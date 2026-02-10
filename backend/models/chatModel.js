import db from "../config/dbConnect.js";

class ChatModel {
  /**
   * ✅ Create customer if not exists
   * Table: chat_customers(session_id, phone, first_name, last_name)
   *
   * IMPORTANT:
   * - Socket sometimes calls ensureCustomer({ session_id }) only.
   * - So this method must not require phone/first_name/last_name.
   */
  static async ensureCustomer({
    session_id,
    phone = null,
    first_name = null,
    last_name = null,
  }) {
    const { rows } = await db.query(
      `SELECT * FROM chat_customers WHERE session_id = $1 LIMIT 1`,
      [session_id]
    );
    if (rows[0]) return rows[0];

    const { rows: created } = await db.query(
      `INSERT INTO chat_customers (session_id, phone, first_name, last_name)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [session_id, phone, first_name, last_name]
    );
    return created[0];
  }

  /**
   * ✅ Pick one active EMPLOYEE
   * Table: admin_users(role ENUM public.admin_role)
   */
  static async pickEmployee() {
    const { rows } = await db.query(
      `SELECT id, emp_id, role, status, full_name
       FROM admin_users
       WHERE role = 'EMPLOYEE'::admin_role
         AND status = 'active'
       ORDER BY COALESCE(updated_at, created_at) ASC
       LIMIT 1`
    );
    return rows[0] || null;
  }

  /**
   * ✅ Get or create conversation (status=open)
   * chat_conversations(customer_id, employee_id, status, last_message, last_message_at, created_at, updated_at)
   */
  static async ensureConversation(customer_id) {
    const { rows } = await db.query(
      `SELECT *
       FROM chat_conversations
       WHERE customer_id = $1 AND status = 'open'
       ORDER BY id DESC
       LIMIT 1`,
      [customer_id]
    );
    if (rows[0]) return rows[0];

    const emp = await this.pickEmployee();
    if (!emp) throw new Error("No active employee available");

    const { rows: created } = await db.query(
      `INSERT INTO chat_conversations (customer_id, employee_id, status)
       VALUES ($1,$2,'open')
       RETURNING *`,
      [customer_id, emp.id]
    );

    return created[0];
  }

  /**
   * ✅ Insert chat message + update conversation last_message
   * message_type: text | image
   */
  static async insertMessage({
    conversation_id,
    sender_role,
    sender_id,
    message_type = "text",
    message_text,
  }) {
    const { rows } = await db.query(
      `INSERT INTO chat_messages
       (conversation_id, sender_role, sender_id, message_type, message_text)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, conversation_id, sender_role, sender_id, message_type, message_text, created_at`,
      [conversation_id, sender_role, sender_id || null, message_type, message_text]
    );

    const lastMsg = message_type === "image" ? "[image]" : message_text;

    await db.query(
      `UPDATE chat_conversations
       SET last_message = $2,
           last_message_at = now(),
           updated_at = now()
       WHERE id = $1`,
      [conversation_id, lastMsg]
    );

    return rows[0];
  }

  /**
   * ✅ Customer view: latest conversation info by session_id
   */
  static async getCustomerConversation(session_id) {
    const { rows } = await db.query(
      `SELECT c.id AS conversation_id,
              cu.session_id,
              cu.phone AS customer_phone,
              cu.first_name,
              cu.last_name,
              au.id AS employee_id,
              au.emp_id AS employee_emp_id,
              au.full_name AS employee_full_name,
              c.status, c.last_message, c.last_message_at
       FROM chat_conversations c
       JOIN chat_customers cu ON cu.id = c.customer_id
       JOIN admin_users au ON au.id = c.employee_id
       WHERE cu.session_id = $1
       ORDER BY c.id DESC
       LIMIT 1`,
      [session_id]
    );
    return rows[0] || null;
  }

  /**
   * ✅ Admin/Employee list conversations
   */
  static async listConversations({ role, employee_id, limit = 50, offset = 0 }) {
    if (role === "EMPLOYEE") {
      const { rows } = await db.query(
        `SELECT c.id AS conversation_id,
                cu.session_id,
                cu.phone AS customer_phone,
                cu.first_name,
                cu.last_name,
                au.id AS employee_id,
                au.emp_id AS employee_emp_id,
                au.full_name AS employee_full_name,
                c.status, c.last_message, c.last_message_at
         FROM chat_conversations c
         JOIN chat_customers cu ON cu.id = c.customer_id
         JOIN admin_users au ON au.id = c.employee_id
         WHERE c.employee_id = $1
         ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
         LIMIT $2 OFFSET $3`,
        [employee_id, limit, offset]
      );
      return rows;
    }

    // ADMIN
    const { rows } = await db.query(
      `SELECT c.id AS conversation_id,
              cu.session_id,
              cu.phone AS customer_phone,
              cu.first_name,
              cu.last_name,
              au.id AS employee_id,
              au.emp_id AS employee_emp_id,
              au.full_name AS employee_full_name,
              c.status, c.last_message, c.last_message_at
       FROM chat_conversations c
       JOIN chat_customers cu ON cu.id = c.customer_id
       JOIN admin_users au ON au.id = c.employee_id
       ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  }

  static async getMessages(conversation_id, limit = 200, offset = 0) {
    const { rows } = await db.query(
      `SELECT id, sender_role, sender_id, message_type, message_text, created_at
       FROM chat_messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC
       LIMIT $2 OFFSET $3`,
      [conversation_id, limit, offset]
    );
    return rows;
  }

  static async getConversationById(conversation_id) {
    const { rows } = await db.query(
      `SELECT c.*,
              cu.session_id,
              cu.phone AS customer_phone,
              cu.first_name,
              cu.last_name,
              au.id AS employee_id,
              au.emp_id AS employee_emp_id,
              au.full_name AS employee_full_name
       FROM chat_conversations c
       JOIN chat_customers cu ON cu.id = c.customer_id
       JOIN admin_users au ON au.id = c.employee_id
       WHERE c.id = $1
       LIMIT 1`,
      [conversation_id]
    );
    return rows[0] || null;
  }

  // =========================
  // ✅ DELETE SUPPORT METHODS
  // =========================

  static async getMessageById(message_id) {
    const { rows } = await db.query(
      `SELECT id, conversation_id, sender_role, sender_id, message_type, message_text, created_at
       FROM chat_messages
       WHERE id = $1
       LIMIT 1`,
      [message_id]
    );
    return rows[0] || null;
  }

  // ✅ Recalculate conversation last_message / last_message_at
  static async refreshConversationLast(conversation_id) {
    const { rows } = await db.query(
      `SELECT message_type, message_text, created_at
       FROM chat_messages
       WHERE conversation_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [conversation_id]
    );

    if (!rows[0]) {
      await db.query(
        `UPDATE chat_conversations
         SET last_message = NULL,
             last_message_at = NULL,
             updated_at = now()
         WHERE id = $1`,
        [conversation_id]
      );
      return;
    }

    const last = rows[0];
    const lastMsg = last.message_type === "image" ? "[image]" : last.message_text;

    await db.query(
      `UPDATE chat_conversations
       SET last_message = $2,
           last_message_at = $3,
           updated_at = now()
       WHERE id = $1`,
      [conversation_id, lastMsg, last.created_at]
    );
  }
  // ✅ Update a single message
  static async updateMessage(message_id, new_text) {
    const { rows } = await db.query(
      `UPDATE chat_messages
       SET message_text = $2
       WHERE id = $1
       RETURNING id, conversation_id, sender_role, sender_id, message_type, message_text, created_at`,
      [message_id, new_text]
    );
    return rows[0] || null;
  }

  // ✅ Delete a single message (hard delete)
  static async deleteMessage(message_id) {
    const { rows } = await db.query(
      `DELETE FROM chat_messages
       WHERE id = $1
       RETURNING id, conversation_id`,
      [message_id]
    );
    return rows[0] || null;
  }

  // ✅ Delete conversation + all messages
  static async deleteConversation(conversation_id) {
    await db.query(`DELETE FROM chat_messages WHERE conversation_id = $1`, [
      conversation_id,
    ]);

    const { rows } = await db.query(
      `DELETE FROM chat_conversations
       WHERE id = $1
       RETURNING id`,
      [conversation_id]
    );

    return rows[0] || null;
  }
}

export default ChatModel;
