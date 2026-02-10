// src/controllers/reportLogWebMmoney.controller.js
import { countLogs, listLogs, statsLogs } from "../models/logWebMmoney.model.js";

export async function getLogWebMmoneyReport(req, res) {
  try {
    const {
      q = "",
      bank = "all",
      type = "all",
      dateFrom = "",
      dateTo = "",
      page = "1",
      limit = "15",
      sortBy = "id",
      sortDir = "desc",
    } = req.query;

    const filters = { q, bank, type, dateFrom, dateTo };

    const [total, rows, stats] = await Promise.all([
      countLogs(filters),
      listLogs({
        ...filters,
        page: Number(page),
        limit: Number(limit),
        sortBy,
        sortDir,
      }),
      statsLogs(filters),
    ]);

    return res.json({
      success: true,
      data: rows,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.max(1, Math.ceil(total / Number(limit))),
        sortBy,
        sortDir,
        filters,
      },
      stats: {
        total: stats.total,
        totalAmount: Number(stats.total_amount || 0),
        uniqueMsisdn: stats.unique_msisdn,
      },
    });
  } catch (err) {
    console.error("getLogWebMmoneyReport error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load log_web_mmoney report",
    });
  }
}

/**
 * Optional: CSV export endpoint (server-side)
 * GET /api/reports/log-web-mmoney/export
 */
export async function exportLogWebMmoneyCSV(req, res) {
  try {
    const {
      q = "",
      bank = "all",
      type = "all",
      dateFrom = "",
      dateTo = "",
      sortBy = "id",
      sortDir = "desc",
    } = req.query;

    const filters = { q, bank, type, dateFrom, dateTo };

    // export all rows (limit high)
    const rows = await listLogs({
      ...filters,
      page: 1,
      limit: 100000, // adjust if needed
      sortBy,
      sortDir,
    });

    const headers = ["id", "tranid", "bank", "amount", "type", "msisdn", "created", "tranid_packages"];
    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
    ].join("\n");

    const filename = `log_web_mmoney_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (err) {
    console.error("exportLogWebMmoneyCSV error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to export CSV",
    });
  }
}
