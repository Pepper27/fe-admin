import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { pathAdmin } from "../../../config/api";

const formatDateTime = (date) => {
  if (!date) return "";
  try {
    return new Date(date).toLocaleString("vi-VN");
  } catch {
    return String(date);
  }
};

const formatMoney = (n) => {
  const num = Number(n) || 0;
  return num.toLocaleString("vi-VN") + "₫";
};

export default function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("token");
    const controller = new AbortController();
    setLoading(true);

    // fetch client detail
    fetch(`${pathAdmin}/admin/clients/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include",
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.code === "error") throw new Error(data.message || "Unauthorized");
        setClient(data?.data || data);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        console.error("Fetch client failed", err);
        alert(err?.message || "Failed to fetch client");
      });

    // fetch orders for client (best-effort)
    fetch(`${pathAdmin}/admin/order?userId=${id}&limit=20&page=1`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include",
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.code === "error") throw new Error(data.message || "Unauthorized");
        setOrders(data?.data || []);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        console.error("Fetch client orders failed", err);
        setOrders([]);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
        <div className="bg-[white] rounded-[20px] p-[30px] text-[14px] text-gray-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
      <div className="sm:text-[30px] text-[20px] font-[700] mb-[20px]">Chi tiết khách hàng</div>
      <div className="bg-[white] rounded-[20px] p-[24px] border border-gray-300 mb-[20px]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-500">Tên</div>
            <div className="font-[700]">{client?.fullName || "(Chưa có)"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Email</div>
            <div className="font-[700] break-all">{client?.email || ""}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Số điện thoại</div>
            <div className="font-[700]">{client?.phone || ""}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">ID</div>
            <div className="font-[700] break-all">{client?._id || client?.id}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Tạo lúc</div>
            <div className="font-[700]">{formatDateTime(client?.createdAt)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Số đơn hàng</div>
            <div className="font-[700]">{client?.ordersCount ?? orders.length}</div>
          </div>
        </div>
        <div className="mt-4">
          <Link to="/admin/client" className="text-pri underline">Quay lại danh sách</Link>
        </div>
      </div>

      <div className="bg-[white] rounded-[20px] p-[24px] border border-gray-300">
        <div className="text-[18px] font-[700] mb-4">Đơn hàng gần đây</div>
        {orders.length === 0 ? (
          <div className="text-gray-500">Không tìm thấy đơn hàng.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#e5e1e1]">
                <tr>
                  <td className="p-3 font-[600]">Mã đơn</td>
                  <td className="p-3 font-[600]">Tổng tiền</td>
                  <td className="p-3 font-[600]">Trạng thái</td>
                  <td className="p-3 font-[600]">Tạo lúc</td>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td className="p-3 font-[700]">{o.orderCode || o._id}</td>
                    <td className="p-3">{formatMoney(o.totalPrice)}</td>
                    <td className="p-3">{o.status}</td>
                    <td className="p-3">{formatDateTime(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
