import { useEffect, useState } from "react";
import { pathAdmin } from "../../config/api";

export default function RefundsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${pathAdmin}/admin/refunds`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const data = await res.json();
      setRows(data?.data || []);
    } catch (err) {
      console.error(err);
      alert("Không thể tải refund jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const retry = async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${pathAdmin}/admin/refunds/${encodeURIComponent(id)}/retry`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) return alert(data?.error?.message || "Retry failed");
    fetchList();
  };

  const manual = async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${pathAdmin}/admin/refunds/${encodeURIComponent(id)}/manual`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "mark_manual" }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data?.error?.message || "Action failed");
    fetchList();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Refund Jobs</h2>
      {loading ? <div>Đang tải...</div> : null}
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th>ID</th>
            <th>Order</th>
            <th>Provider</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Attempts</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id}>
              <td>{r._id}</td>
              <td>{r.orderCode}</td>
              <td>{r.provider}</td>
              <td>{r.payload?.amount || "-"}</td>
              <td>{r.status}</td>
              <td>{r.attempts}</td>
              <td>
                <button onClick={() => retry(r._id)}>Retry</button>
                <button onClick={() => manual(r._id)}>Mark Manual</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
