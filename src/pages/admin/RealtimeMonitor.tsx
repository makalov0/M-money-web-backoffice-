import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../../MainLayout";

type ActivityLog = {
  id: number;

  user_id?: number | null;          // optional (if backend returns)
  emp_id: string | null;
  role: string | null;

  // ✅ joined from admin_users
  admin_name?: string | null;       // <-- full name from admin_users.full_name
  admin_phone?: string | null;      // optional

  action: string;
  page: string | null;
  created_at: string;
  ip?: string | null;
};

export default function RealtimeMonitor(): React.ReactElement {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [status, setStatus] = useState<"connecting" | "live" | "closed" | "error">(
    "connecting"
  );
  const [search, setSearch] = useState("");

  const token = useMemo(() => localStorage.getItem("token") || "", []);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    setStatus("connecting");

    const fetchLogs = async () => {
      try {
        const res = await fetch(
          "http://localhost:5001/api/audit/logs?limit=200&offset=0",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const json = await res.json();

        if (json?.success) {
          setLogs(json.data || []);
          setStatus("live");
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("audit fetch error:", err);
        setStatus("error");
      }
    };

    fetchLogs();
    const timer = setInterval(fetchLogs, 5000);

    return () => {
      clearInterval(timer);
      setStatus("closed");
    };
  }, [token]);

  // ✅ search filter (include admin_name too)
  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;

    const q = search.toLowerCase();

    return logs.filter((l) =>
      [
        l.admin_name,
        l.emp_id,
        l.role,
        l.action,
        l.page,
        l.ip,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [logs, search]);

  return (
    <MainLayout title="Realtime Monitoring">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
          <h1 className="text-xl font-bold">Realtime Monitoring</h1>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search name, emp_id, role, action, page…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            <div className="text-sm">
              Status:{" "}
              <span
                className={`font-semibold ${
                  status === "live"
                    ? "text-green-600"
                    : status === "error"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div
          className="bg-white rounded-xl shadow p-4 overflow-auto"
          style={{ maxHeight: 600 }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Time</th>
                <th>Full name</th>
                <th>emp_id</th>
                <th>role</th>
                <th>action</th>
                <th>page</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map((x) => (
                <tr
                  key={x.id}
                  className="border-b last:border-b-0 hover:bg-gray-50"
                >
                  <td className="py-2 whitespace-nowrap">
                    {new Date(x.created_at).toLocaleString()}
                  </td>

                  {/* ✅ show full name from JOIN */}
                  <td className="font-medium">
                    {x.admin_name || "-"}
                  </td>

                  <td>{x.emp_id || "-"}</td>
                  <td>{x.role || "-"}</td>
                  <td className="font-medium">{x.action}</td>
                  <td className="font-mono text-xs">{x.page || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="text-gray-500 mt-4 text-center">No logs found</div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
