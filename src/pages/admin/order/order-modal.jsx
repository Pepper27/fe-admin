import { useEffect, useState } from "react";
import { pathAdmin } from "../../../config/api";

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const PAY_LABELS = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
};

const METHOD_LABELS = {
  cash: "Tiền mặt",
  zalopay: "ZaloPay",
};

const formatMoney = (n) => {
  const num = Number(n) || 0;
  return num.toLocaleString("vi-VN") + "₫";
};

export default function OrderModal({ open, orderId, onClose, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [payStatus, setPayStatus] = useState("");

  useEffect(() => {
    if (!open || !orderId) return;
    const token = localStorage.getItem("token");
    const controller = new AbortController();

    setLoading(true);
    fetch(`${pathAdmin}/admin/order/${orderId}`, {
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
        const o = data?.data;
        setOrder(o || null);
        setStatus(o?.status || "pending");
        setPayStatus(o?.payStatus || "unpaid");
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        console.error("Fetch order detail failed", err);
        alert(err?.message || "Failed to fetch");
        setOrder(null);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [open, orderId]);

  const save = async () => {
    if (!orderId) return;
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${pathAdmin}/admin/order/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        credentials: "include",
        body: JSON.stringify({ status, payStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Update failed");

      onUpdated?.(data?.data);
      onClose?.();
    } catch (e) {
      alert(e?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 px-[12px]">
      <div className="w-full max-w-[920px] rounded-[16px] bg-white border border-gray-200 shadow-lg">
        <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-gray-200">
          <div className="font-[800] text-[16px]">Chi tiết đơn hàng</div>
          <button
            type="button"
            onClick={onClose}
            className="px-[10px] py-[6px] rounded-[10px] border border-gray-300 hover:bg-gray-50 text-[14px]"
          >
            Đóng
          </button>
        </div>

        <div className="p-[18px]">
          {loading ? (
            <div className="text-[14px] text-gray-500">Đang tải...</div>
          ) : !order ? (
            <div className="text-[14px] text-gray-500">Không có dữ liệu</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
                <div className="rounded-[12px] border border-gray-200 p-[12px]">
                  <div className="text-[12px] text-gray-500">Mã đơn</div>
                  <div className="font-[800]">{order.orderCode || order._id}</div>
                  <div className="mt-[8px] text-[12px] text-gray-500">Khách hàng</div>
                  <div className="text-[14px]">{order?.userId?.fullName || "(Chưa có)"}</div>
                  <div className="text-[13px] text-gray-600 break-all">{order?.userId?.email || ""}</div>
                  <div className="text-[13px] text-gray-600">{order?.userId?.phone || order.phone || ""}</div>
                </div>

                <div className="rounded-[12px] border border-gray-200 p-[12px]">
                  <div className="text-[12px] text-gray-500">Tổng tiền</div>
                  <div className="font-[900] text-[18px]">{formatMoney(order.totalPrice)}</div>
                  <div className="mt-[8px] text-[12px] text-gray-500">Địa chỉ</div>
                  <div className="text-[14px]">{order.address || ""}</div>
                  <div className="mt-[8px] text-[12px] text-gray-500">Phương thức</div>
                  <div className="text-[14px]">{METHOD_LABELS[order.method] || order.method}</div>
                </div>
              </div>

              <div className="mt-[12px] grid grid-cols-1 md:grid-cols-2 gap-[12px]">
                <div className="rounded-[12px] border border-gray-200 p-[12px]">
                  <div className="text-[12px] text-gray-500 mb-[6px]">Trạng thái đơn</div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-[10px] px-[10px] py-[10px] outline-none text-[14px]"
                  >
                    {Object.keys(STATUS_LABELS).map((k) => (
                      <option key={k} value={k}>
                        {STATUS_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rounded-[12px] border border-gray-200 p-[12px]">
                  <div className="text-[12px] text-gray-500 mb-[6px]">Thanh toán</div>
                  <select
                    value={payStatus}
                    onChange={(e) => setPayStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-[10px] px-[10px] py-[10px] outline-none text-[14px]"
                  >
                    {Object.keys(PAY_LABELS).map((k) => (
                      <option key={k} value={k}>
                        {PAY_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-[12px] rounded-[12px] border border-gray-200 p-[12px]">
                <div className="font-[800] mb-[10px]">Sản phẩm</div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-[#e5e1e1]">
                      <tr>
                        <td className="p-[12px] text-[14px] font-[700] rounded-l-[10px] w-[90px]">Ảnh</td>
                        <td className="p-[12px] text-[14px] font-[700]">Tên</td>
                        <td className="p-[12px] text-[14px] font-[700] w-[140px]">Giá</td>
                        <td className="p-[12px] text-[14px] font-[700] w-[110px]">SL</td>
                        <td className="p-[12px] text-[14px] font-[700] rounded-r-[10px] w-[160px]">Thành tiền</td>
                      </tr>
                    </thead>
                    <tbody>
                      {(order.cart || []).map((it, idx) => {
                        const price = Number(it?.price) || 0;
                        const qty = Number(it?.quantity) || 0;
                        const line = price * qty;
                        return (
                          <tr key={idx}>
                            <td className="p-[12px]">
                              <img
                                src={it?.image || "/image/demo.jpg"}
                                alt=""
                                className="w-[56px] h-[56px] object-cover rounded-[10px] border border-gray-200"
                              />
                            </td>
                            <td className="p-[12px] text-[14px]">
                              <div className="font-[700]">{it?.name || "(Không có tên)"}</div>
                              <div className="text-[12px] text-gray-500">variant: {it?.variantId || ""}</div>
                            </td>
                            <td className="p-[12px] text-[14px]">{formatMoney(price)}</td>
                            <td className="p-[12px] text-[14px]">{qty}</td>
                            <td className="p-[12px] text-[14px] font-[800]">{formatMoney(line)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-[14px] flex items-center justify-end gap-[10px]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-[14px] py-[10px] rounded-[12px] border border-gray-300 hover:bg-gray-50 text-[14px]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={save}
                  className="px-[14px] py-[10px] rounded-[12px] bg-pri hover:bg-second text-white text-[14px] disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
