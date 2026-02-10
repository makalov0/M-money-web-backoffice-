// backend/models/promotionModel.js
import pool from "../config/dbConnect.js";

class PromotionModel {
  // =========================
  // GET ALL (filters + search)
  // =========================
  static async getAllPromotions(filters = {}) {
    const { type, status, search } = filters;

    let q = `SELECT * FROM public.promotions WHERE 1=1`;
    const params = [];
    let i = 1;

    if (status && status !== "all") {
      q += ` AND status = $${i++}`;
      params.push(status);
    }

    if (type && type !== "all") {
      q += ` AND type = $${i++}`;
      params.push(type);
    }

    if (search && String(search).trim() !== "") {
      const s = `%${search}%`;
      q += ` AND (code ILIKE $${i} OR name ILIKE $${i + 1} OR description ILIKE $${i + 2})`;
      params.push(s, s, s);
      i += 3;
    }

    q += ` ORDER BY id DESC`;

    const { rows } = await pool.query(q, params);
    return rows;
  }

  // =========================
  // GET BY ID
  // =========================
  static async getPromotionById(id) {
    const { rows } = await pool.query(
      `SELECT * FROM public.promotions WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  // =========================
  // GET BY CODE
  // =========================
  static async getPromotionByCode(code) {
    const { rows } = await pool.query(
      `SELECT * FROM public.promotions WHERE code = $1`,
      [code]
    );
    return rows[0] || null;
  }

  // =========================
  // CREATE
  // =========================
  static async createPromotion(data) {
    // applicable_services is TEXT[] in DB => send JS array directly (NOT JSON.stringify)
    const applicable = Array.isArray(data.applicable_services)
      ? data.applicable_services
      : [];

    const { rows } = await pool.query(
      `
      INSERT INTO public.promotions
      (code, name, description, type,
       discount_value, min_amount, max_discount,
       start_date, end_date, usage_limit, used_count,
       status, applicable_services, created_by)
      VALUES
      ($1,$2,$3,$4,
       $5,$6,$7,
       $8,$9,$10,$11,
       $12,$13,$14)
      RETURNING id
      `,
      [
        data.code,
        data.name,
        data.description,
        data.type,
        Number(data.discount_value ?? 0),
        Number(data.min_amount ?? 0),
        data.max_discount !== undefined && data.max_discount !== "" ? Number(data.max_discount) : null,
        data.start_date,
        data.end_date,
        Number(data.usage_limit ?? 0),
        Number(data.used_count ?? 0),
        data.status ?? "scheduled",
        applicable,
        data.created_by ?? "admin",
      ]
    );

    return rows[0].id;
  }

  // =========================
  // UPDATE (dynamic)
  // =========================
  static async updatePromotion(id, data) {
    const fields = [];
    const values = [];
    let i = 1;

    const map = {
      code: "code",
      name: "name",
      description: "description",
      type: "type",
      discount_value: "discount_value",
      min_amount: "min_amount",
      max_discount: "max_discount",
      start_date: "start_date",
      end_date: "end_date",
      usage_limit: "usage_limit",
      used_count: "used_count",
      status: "status",
      applicable_services: "applicable_services",
      created_by: "created_by",
    };

    for (const key of Object.keys(map)) {
      if (data[key] === undefined) continue;

      if (key === "applicable_services") {
        const arr = Array.isArray(data[key]) ? data[key] : [];
        fields.push(`${map[key]} = $${i++}`);
        values.push(arr);
        continue;
      }

      if (key === "discount_value" || key === "min_amount" || key === "max_discount") {
        // allow null for max_discount
        if (key === "max_discount" && (data[key] === "" || data[key] === null)) {
          fields.push(`${map[key]} = $${i++}`);
          values.push(null);
        } else {
          fields.push(`${map[key]} = $${i++}`);
          values.push(Number(data[key]));
        }
        continue;
      }

      if (key === "usage_limit" || key === "used_count") {
        fields.push(`${map[key]} = $${i++}`);
        values.push(Number(data[key]));
        continue;
      }

      fields.push(`${map[key]} = $${i++}`);
      values.push(data[key]);
    }

    if (fields.length === 0) return 0;

    // updated_at is timestamp in your DB => use NOW()
    fields.push(`updated_at = NOW()`);

    const q = `
      UPDATE public.promotions
      SET ${fields.join(", ")}
      WHERE id = $${i}
    `;
    values.push(id);

    const result = await pool.query(q, values);
    return result.rowCount;
  }

  // =========================
  // DELETE
  // =========================
  static async deletePromotion(id) {
    const result = await pool.query(
      `DELETE FROM public.promotions WHERE id = $1`,
      [id]
    );
    return result.rowCount;
  }

  // =========================
  // STATS
  // =========================
  static async getStatistics() {
    const total = await pool.query(`SELECT COUNT(*)::int AS total FROM public.promotions`);
    const active = await pool.query(`SELECT COUNT(*)::int AS active FROM public.promotions WHERE status='active'`);
    const scheduled = await pool.query(`SELECT COUNT(*)::int AS scheduled FROM public.promotions WHERE status='scheduled'`);
    const byType = await pool.query(`SELECT type, COUNT(*)::int AS count FROM public.promotions GROUP BY type ORDER BY count DESC`);
    const usage = await pool.query(`SELECT COALESCE(SUM(used_count),0)::int AS total_usage FROM public.promotions`);
    const avgDiscount = await pool.query(
      `SELECT COALESCE(AVG(discount_value),0)::numeric AS avg_discount FROM public.promotions WHERE type <> 'free_service'`
    );

    return {
      total: total.rows[0].total,
      active: active.rows[0].active,
      scheduled: scheduled.rows[0].scheduled,
      byType: byType.rows,
      totalUsage: usage.rows[0].total_usage,
      avgDiscount: Number(avgDiscount.rows[0].avg_discount),
    };
  }

  // =========================
  // ACTIVE
  // =========================
  static async getActivePromotions() {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM public.promotions
      WHERE status = 'active'
        AND start_date <= CURRENT_DATE
        AND end_date >= CURRENT_DATE
      ORDER BY id DESC
      `
    );
    return rows;
  }

  // =========================
  // VALIDATE CODE
  // =========================
  static async validatePromotion(code, amount) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM public.promotions
      WHERE code = $1
        AND status = 'active'
        AND start_date <= CURRENT_DATE
        AND end_date >= CURRENT_DATE
        AND used_count < usage_limit
        AND min_amount <= $2
      LIMIT 1
      `,
      [code, Number(amount)]
    );
    return rows[0] || null;
  }

  // =========================
  // INCREMENT USED COUNT
  // =========================
  static async incrementUsageCount(id) {
    const { rows } = await pool.query(
      `UPDATE public.promotions SET used_count = used_count + 1, updated_at = NOW() WHERE id = $1 RETURNING used_count`,
      [id]
    );
    return rows[0];
  }
}

export default PromotionModel;
