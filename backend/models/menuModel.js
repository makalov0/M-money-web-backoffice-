import pool from "../config/dbConnect.js";

class MenuModel {
  static async getAll() {
    const q = `
      SELECT id, name, name_lao, group_name, order_index, order_group_index,
             status, image, description, created_at, updated_at
      FROM public.menus
      ORDER BY order_group_index ASC NULLS LAST, order_index ASC NULLS LAST, id DESC
    `;
    const { rows } = await pool.query(q);
    return rows;
  }

  static async getById(id) {
    const q = `
      SELECT id, name, name_lao, group_name, order_index, order_group_index,
             status, image, description, created_at, updated_at
      FROM public.menus
      WHERE id = $1
    `;
    const { rows } = await pool.query(q, [id]);
    return rows[0] || null;
  }

  static async create(payload) {
    const q = `
      INSERT INTO public.menus
      (name, name_lao, group_name, order_index, order_group_index, status, image, description)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `;
    const values = [
      payload.name,
      payload.name_lao,
      payload.group_name || null,
      payload.order_index ?? null,
      payload.order_group_index ?? null,
      payload.status || "A",
      payload.image || null,
      payload.description || null,
    ];
    const { rows } = await pool.query(q, values);
    return rows[0];
  }

  static async update(id, payload) {
    const q = `
      UPDATE public.menus
      SET name=$1,
          name_lao=$2,
          group_name=$3,
          order_index=$4,
          order_group_index=$5,
          status=$6,
          image=$7,
          description=$8,
          updated_at=NOW()
      WHERE id=$9
      RETURNING *
    `;
    const values = [
      payload.name,
      payload.name_lao,
      payload.group_name || null,
      payload.order_index ?? null,
      payload.order_group_index ?? null,
      payload.status || "A",
      payload.image || null,
      payload.description || null,
      id,
    ];
    const { rows } = await pool.query(q, values);
    return rows[0] || null;
  }

  static async delete(id) {
    const q = `DELETE FROM public.menus WHERE id=$1 RETURNING id`;
    const { rows } = await pool.query(q, [id]);
    return rows[0] || null;
  }
}

export default MenuModel;
