import pool from "../config/dbConnect.js";

class SubmenuModel {
  static async getAll(menuId) {
    const q = `
      SELECT id, menu_id, name, name_lao, group_name, order_index, order_group_index,
             status, image, description, created_at, updated_at
      FROM public.submenus
      WHERE ($1::int IS NULL OR menu_id = $1)
      ORDER BY order_group_index ASC NULLS LAST, order_index ASC NULLS LAST, id DESC
    `;
    const { rows } = await pool.query(q, [menuId ?? null]);
    return rows;
  }

  static async getById(id) {
    const q = `
      SELECT id, menu_id, name, name_lao, group_name, order_index, order_group_index,
             status, image, description, created_at, updated_at
      FROM public.submenus
      WHERE id = $1
    `;
    const { rows } = await pool.query(q, [id]);
    return rows[0] || null;
  }

  static async create(payload) {
    const q = `
      INSERT INTO public.submenus
      (menu_id, name, name_lao, group_name, order_index, order_group_index, status, image, description)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `;
    const values = [
      payload.menu_id,
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
      UPDATE public.submenus
      SET menu_id=$1,
          name=$2,
          name_lao=$3,
          group_name=$4,
          order_index=$5,
          order_group_index=$6,
          status=$7,
          image=$8,
          description=$9,
          updated_at=NOW()
      WHERE id=$10
      RETURNING *
    `;
    const values = [
      payload.menu_id,
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
    const q = `DELETE FROM public.submenus WHERE id=$1 RETURNING id`;
    const { rows } = await pool.query(q, [id]);
    return rows[0] || null;
  }
}

export default SubmenuModel;
