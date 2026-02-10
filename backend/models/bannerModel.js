import pool from "../config/dbConnect.js";

const RETRY = new Set(["ECONNRESET", "ETIMEDOUT", "EPIPE"]);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

class BannerModel {
  static async getAll({ limit = 200, offset = 0 } = {}, retries = 3) {
    const q = `
      SELECT
        w_id, title, description, web_view_url, img_url, "index", status
      FROM public.web_mmoney
      ORDER BY w_id DESC
      LIMIT $1 OFFSET $2
    `;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const { rows } = await pool.query(q, [limit, offset]);
        return rows;
      } catch (err) {
        console.error(`❌ BannerModel.getAll attempt ${attempt}/${retries} failed:`, err.code, err.message);

        if (attempt === retries || !RETRY.has(err.code)) throw err;

        const delay = Math.min(300 * Math.pow(2, attempt - 1), 2000);
        await sleep(delay);
      }
    }
  }

  static async create({ title, description, web_view_url, img_url, index, status }) {
    const q = `
      INSERT INTO public.web_mmoney
        (title, description, web_view_url, img_url, "index", status)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING
        w_id, title, description, web_view_url, img_url, "index", status
    `;
    const values = [
      title ?? null,
      description ?? null,
      web_view_url ?? null,
      img_url ?? null,
      index ?? null,
      status ?? "active",
    ];
    const { rows } = await pool.query(q, values);
    return rows[0];
  }

  static async updateById(w_id, { title, description, web_view_url, img_url, index, status }) {
    const q = `
      UPDATE public.web_mmoney
      SET
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        web_view_url = COALESCE($4, web_view_url),
        img_url = COALESCE($5, img_url),
        "index" = COALESCE($6, "index"),
        status = COALESCE($7, status)
      WHERE w_id = $1
      RETURNING
        w_id, title, description, web_view_url, img_url, "index", status
    `;
    const values = [w_id, title ?? null, description ?? null, web_view_url ?? null, img_url ?? null, index ?? null, status ?? null];
    const { rows } = await pool.query(q, values);
    return rows[0];
  }

  static async deleteById(w_id) {
    const q = `DELETE FROM public.web_mmoney WHERE w_id = $1 RETURNING w_id`;
    const { rows } = await pool.query(q, [w_id]);
    return rows[0];
  }
}

export default BannerModel;
