import { useEffect, useState } from "react";
import { pathAdmin } from "../../../config/api";

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đang chuẩn bị",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

// Luồng dịch chuyển trạng thái tuần tự thông thường
const STATUS_FLOW = ["pending", "confirmed", "shipping", "delivered", "cancelled"];

const PAY_LABELS = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
};

const METHOD_LABELS = {
  cash: "Tiền mặt",
  zalopay: "ZaloPay",
};

const isPaidOrder = (order) => {
  if (!order) return false;
  if (String(order?.payStatus || "").trim().toLowerCase() === "paid") return true;
  if (Number(order?.payment?.capturedAmount) > 0) return true;
  if (String(order?.payment?.zpTransId || "").trim()) return true;
  return false;
};

const isPaidZaloPayOrder = (order, nextPayStatus) => {
  if (!order) return false;
  const isZaloPay = String(order?.method || "").trim().toLowerCase() === "zalopay";
  if (!isZaloPay) return false;
  if (String(nextPayStatus || "").trim().toLowerCase() === "paid") return true;
  return isPaidOrder(order);
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
        const inferredPayStatus = isPaidOrder(o) ? "paid" : "unpaid";
        setPayStatus(inferredPayStatus);
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
    if (status === "cancelled" && isPaidZaloPayOrder(order, payStatus)) {
      alert("Đơn ZaloPay đã thanh toán không thể hủy");
      return;
    }
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

  const downloadImage = async (url, filename) => {
    try {
      const resp = await fetch(url, { mode: 'cors' });
      if (!resp.ok) throw new Error('Network error');
      const blob = await resp.blob();
      const ext = (blob.type && blob.type.split('/')[1]) || 'jpg';
      const name = filename || `image.${ext}`;
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (e) {
      try {
        window.open(url, '_blank');
      } catch (_) {}
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 px-[12px]">
      <div className="w-full max-w-[920px] rounded-[16px] bg-white border border-gray-200 shadow-lg flex flex-col" style={{ maxHeight: 'calc(100vh - 48px)' }}>
        <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-gray-200 flex-shrink-0">
          <div className="font-[800] text-[16px]">Chi tiết đơn hàng</div>
          <button
            type="button"
            onClick={onClose}
            className="px-[10px] py-[6px] rounded-[10px] border border-gray-300 hover:bg-gray-50 text-[14px]"
          >
            Đóng
          </button>
        </div>

        <div className="p-[18px] overflow-auto" style={{ flex: '1 1 auto' }}>
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
                  <div className="text-[14px]">{order?.userId?.fullName || order?.fullName || "(Chưa có)"}</div>
                  <div className="text-[13px] text-gray-600 break-all">{order?.userId?.email || order?.email || ""}</div>
                  <div className="text-[13px] text-gray-600">{order?.userId?.phone || order?.phone || ""}</div>
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
                {/* TRẠNG THÁI ĐƠN HÀNG */}
                <div className="rounded-[12px] border border-gray-200 p-[12px]">
                  <div className="text-[12px] text-gray-500 mb-[6px]">Trạng thái đơn</div>
                  <select
                    value={status}
                    onChange={(e) => {
                      const nextStatus = e.target.value;
                      setStatus(nextStatus);
                      // Tự động chuyển Đã thanh toán khi bấm chọn Đã giao
                      if (nextStatus === "delivered") {
                        setPayStatus("paid");
                      }
                    }}
                    className="w-full border border-gray-300 rounded-[10px] px-[10px] py-[10px] outline-none text-[14px]"
                    // Khóa hoàn toàn nếu đơn từ dữ liệu gốc đã Đã giao hoặc Đã hủy
                    disabled={order?.status === "cancelled" || order?.status === "delivered" || status === "cancelled"}
                  >
                    {(() => {
                      // Nếu trạng thái ban đầu của đơn hàng là đã huỷ, chỉ hiển thị duy nhất option huỷ
                      if (order?.status === "cancelled") {
                        return <option value="cancelled">{STATUS_LABELS.cancelled}</option>;
                      }

                       const orgStatus = String(order?.status || "pending");
                       const orgIdx = STATUS_FLOW.indexOf(orgStatus);
                       const paidZaloPay = isPaidZaloPayOrder(order, payStatus);

                       return STATUS_FLOW.map((k, idx) => {
                         const isCurrentStatus = idx === orgIdx;
                         const isExactlyNext = idx === orgIdx + 1;

                         // ĐIỀU KIỆN 1: Cho phép hủy đơn ('cancelled') khi đơn hiện tại đang ở mức 'pending' hoặc 'confirmed'
                        const isAllowedCancel =
                          k === "cancelled" &&
                          (orgStatus === "pending" || orgStatus === "confirmed") &&
                          !paidZaloPay;

                        // Một phần tử hoạt động nếu nó là hiện tại, là bước tiếp theo liền kề, hoặc lệnh hủy hợp lệ
                        const shouldDisable = !isCurrentStatus && !isExactlyNext && !isAllowedCancel;

                        return (
                          <option
                            key={k}
                            value={k}
                            disabled={shouldDisable}
                          >
                            {STATUS_LABELS[k]}
                          </option>
                        );
                      });
                    })()}
                  </select>
                </div>

                {/* TRẠNG THÁI THANH TOÁN */}
                <div className="rounded-[12px] border border-gray-200 p-[12px]">
                  <div className="text-[12px] text-gray-500 mb-[6px]">Thanh toán</div>
                  <select
                    value={payStatus}
                    onChange={(e) => setPayStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-[10px] px-[10px] py-[10px] outline-none text-[14px]"
                    // Khóa hoàn toàn select nếu đơn hàng đã được thanh toán hoặc đơn hàng đã bị hủy
                    disabled={order?.payStatus === "paid" || order?.status === "cancelled" || status === "cancelled"} 
                  >
                    {Object.keys(PAY_LABELS).map((k) => {
                      const isUnpaidOption = k === "unpaid";
                      const isCurrentlyPaid = payStatus === "paid";

                      return (
                        <option 
                          key={k} 
                          value={k}
                          disabled={isCurrentlyPaid && isUnpaidOption}
                        >
                          {PAY_LABELS[k]}
                        </option>
                      );
                    })}
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

                        const classificationParts = [];
                        if (it?.size) classificationParts.push(it.size);
                        if (it?.material) classificationParts.push(it.material);
                        if (it?.color) classificationParts.push(it.color);
                        if (it?.variantName) classificationParts.push(it.variantName);
                        if (it?.variant?.name) classificationParts.push(it.variant.name);
                        const classification = classificationParts.filter(Boolean).join(" · ") || (it?.variantCode || it?.variantId || "");

                        return (
                          <div key={idx} style={{ display: 'contents' }}>
                            <tr>
                              <td className="p-[12px]">
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                  <img
                                    src={it?.image || "/image/demo.jpg"}
                                    alt=""
                                    className="w-[56px] h-[56px] object-cover rounded-[10px] border border-gray-200"
                                  />
                                </div>
                              </td>
                              <td className="p-[12px] text-[14px]">
                                <div className="font-[700]">{it?.name || "(Không có tên)"}</div>
                                {classification ? (
                                  <div className="text-[12px] text-gray-500">{classification}</div>
                                ) : null}
                              </td>
                              <td className="p-[12px] text-[14px]">{formatMoney(price)}</td>
                              <td className="p-[12px] text-[14px]">{qty}</td>
                              <td className="p-[12px] text-[14px] font-[800]">{formatMoney(line)}</td>
                            </tr>

                            {it?.engraving?.previewImage ? (
                              <tr key={`engr-${idx}`} className="bg-white">
                                <td colSpan={5} className="p-[8px] pb-[16px]">
                                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                      <div style={{ fontSize: 13, color: '#374151', fontWeight: 700 }}>Ảnh khắc</div>
                                      <div style={{ marginTop: 8 }}>
                                        <img
                                          src={it.engraving.previewImage}
                                          alt="khắc"
                                          className="rounded-[8px] border border-gray-200"
                                          style={{ width: 120, height: 120, objectFit: 'cover' }}
                                        />
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                      <a href={it.engraving.previewImage} target="_blank" rel="noreferrer" className="text-sm text-[#2563eb]">Mở ảnh</a>
                                      <button
                                        type="button"
                                        onClick={() => downloadImage(it.engraving.previewImage, `${order.orderCode || order._id}-engraving.jpg`)}
                                        className="text-sm"
                                        style={{ color: '#2563eb', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
                                      >
                                        Tải xuống
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ) : null}
                          </div>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-[18px] py-[12px] border-t border-gray-200 flex items-center justify-end gap-[10px] flex-shrink-0">
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
      </div>
    </div>
  );
}
