// src/models/logWebMmoney.model.js
import pool from "../config/dbConnect.js";

/**
 * Build WHERE clause safely with parameterized queries
 */
function buildWhere({ q, bank, type, dateFrom, dateTo }) {
  const where = [];
  const values = [];

  const add = (sql, val) => {
    values.push(val);
    where.push(sql.replace("?", `$${values.length}`));
  };

  if (q && q.trim()) {
    const like = `%${q.trim()}%`;
    // search across multiple varchar fields
    add(
      `(tranid ILIKE ? OR msisdn ILIKE ? OR bank ILIKE ? OR type ILIKE ? OR tranid_packages ILIKE ?)`,
      like
    );
    // re-use params properly
    values.push(like, like, like, like);
    const baseIndex = values.length - 4;
    where[where.length - 1] = `(tranid ILIKE $${baseIndex} OR msisdn ILIKE $${
      baseIndex + 1
    } OR bank ILIKE $${baseIndex + 2} OR type ILIKE $${baseIndex + 3} OR tranid_packages ILIKE $${baseIndex + 4})`;
  }

  if (bank && bank !== "all") add(`bank = ?`, bank);
  if (type && type !== "all") add(`type = ?`, type);

  /**
   * created is varchar in your DB screenshot.
   * If created is ISO string or timestamp-like, we can compare by converting to timestamp.
   * NOTE: If created contains non-date text, conversion may fail.
   * If that happens, best fix is to change column to timestamptz.
   */
  if (dateFrom) add(`created::timestamp >= ?::timestamp`, `${dateFrom} 00:00:00`);
  if (dateTo) add(`created::timestamp <= ?::timestamp`, `${dateTo} 23:59:59`);

  return {
    whereSql: where.length ? `WHERE ${where.join(" AND ")}` : "",
    values,
  };
}

export async function countLogs(filters) {
  const { whereSql, values } = buildWhere(filters);

  const sql = `
    SELECT COUNT(*)::int AS total
    FROM public.log_web_mmoney
    ${whereSql}
  `;

  const { rows } = await pool.query(sql, values);
  return rows[0]?.total || 0;
}

export async function listLogs({
  q,
  bank,
  type,
  dateFrom,
  dateTo,
  page = 1,
  limit = 15,
  sortBy = "id",
  sortDir = "desc",
}) {
  const allowedSort = new Set([
    "id",
    "tranid",
    "bank",
    "amount",
    "type",
    "msisdn",
    "created",
    "tranid_packages",
  ]);

  const safeSortBy = allowedSort.has(sortBy) ? sortBy : "id";
  const safeSortDir = String(sortDir).toLowerCase() === "asc" ? "asc" : "desc";

  const offset = (Number(page) - 1) * Number(limit);

  const { whereSql, values } = buildWhere({ q, bank, type, dateFrom, dateTo });

  // amount is varchar => ordering numeric is tricky. We'll order text by default.
  // If you want numeric sort: ORDER BY NULLIF(regexp_replace(amount,'[^0-9.-]','','g'),'')::numeric
  const orderSql =
    safeSortBy === "amount"
      ? `ORDER BY NULLIF(regexp_replace(amount,'[^0-9.-]','','g'),'')::numeric ${safeSortDir} NULLS LAST`
      : `ORDER BY ${safeSortBy} ${safeSortDir}`;

  const sql = `
    SELECT id, tranid, bank, amount, type, msisdn, created, tranid_packages
    FROM public.log_web_mmoney
    ${whereSql}
    ${orderSql}
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  const { rows } = await pool.query(sql, [...values, Number(limit), Number(offset)]);
  return rows;
}

export async function statsLogs(filters) {
  const { whereSql, values } = buildWhere(filters);

  const sql = `
    SELECT
      COUNT(*)::int AS total,
      COALESCE(SUM(NULLIF(regexp_replace(amount,'[^0-9.-]','','g'), '')::numeric), 0)::numeric AS total_amount,
      COUNT(DISTINCT NULLIF(msisdn, ''))::int AS unique_msisdn
    FROM public.log_web_mmoney
    ${whereSql}
  `;

  const { rows } = await pool.query(sql, values);
  return rows[0] || { total: 0, total_amount: 0, unique_msisdn: 0 };
}
