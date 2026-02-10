import pool from '../config/dbConnect.js';

class HotNewsModel {
  static async getAll() {
    const q = `
      SELECT news_id, title, description, content, img_url, web_view_url, category, status, created_at, updated_at
      FROM public.web_hot_news
      ORDER BY news_id DESC
    `;
    const { rows } = await pool.query(q);
    return rows;
  }

  static async getById(id) {
    const q = `
      SELECT news_id, title, description, content, img_url, web_view_url, category, status, created_at, updated_at
      FROM public.web_hot_news
      WHERE news_id=$1
    `;
    const { rows } = await pool.query(q, [id]);
    return rows[0] || null;
  }

  static async create(payload) {
    const q = `
      INSERT INTO public.web_hot_news
      (title, description, content, img_url, web_view_url, category, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
    `;
    const values = [
      payload.title,
      payload.description,
      payload.content || null,
      payload.img_url,
      payload.web_view_url || null,
      payload.category || null,
      payload.status || "active",
    ];
    const { rows } = await pool.query(q, values);
    return rows[0];
  }

  static async update(id, payload) {
    const q = `
      UPDATE public.web_hot_news
      SET title=$1,
          description=$2,
          content=$3,
          img_url=$4,
          web_view_url=$5,
          category=$6,
          status=$7
      WHERE news_id=$8
      RETURNING *
    `;
    const values = [
      payload.title,
      payload.description,
      payload.content || null,
      payload.img_url,
      payload.web_view_url || null,
      payload.category || null,
      payload.status || "active",
      id,
    ];
    const { rows } = await pool.query(q, values);
    return rows[0] || null;
  }

  static async delete(id) {
    const q = `DELETE FROM public.web_hot_news WHERE news_id=$1 RETURNING news_id`;
    const { rows } = await pool.query(q, [id]);
    return rows[0] || null;
  }
}

export default HotNewsModel;
