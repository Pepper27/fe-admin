import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { pathAdmin } from "../../../config/api";
import { toast } from "react-toastify";
import { updateClientStatus } from "../../../services/client.service";

const SUCCESS_ORDER_STATUS = "delivered";

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đang chuẩn bị",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const CLIENT_STATUS_LABELS = {
  active: "Hoạt động",
  inactive: "Khóa tài khoản",
};

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

const formatOrderStatus = (status) => STATUS_LABELS[status] || status || "";

const normalizeText = (value) => String(value || "").trim().toLowerCase();

export default function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const clientOrders = orders.filter((order) => {
    const clientId = String(client?._id || client?.id || id || "");
    const orderUserId = String(
      order?.userId?._id || order?.userId?.id || order?.userId || order?.customerId || "",
    );

    if (clientId && orderUserId && clientId === orderUserId) {
      return true;
    }

    const clientEmail = normalizeText(client?.email);
    const clientPhone = normalizeText(client?.phone);
    const orderEmail = normalizeText(order?.userId?.email || order?.email);
    const orderPhone = normalizeText(order?.userId?.phone || order?.phone);

    if (clientEmail && orderEmail && clientEmail === orderEmail) {
      return true;
    }

    if (clientPhone && orderPhone && clientPhone === orderPhone) {
      return true;
    }

    return false;
  });

  const successfulOrders = clientOrders.filter((order) => order?.status === SUCCESS_ORDER_STATUS);
  const successfulOrdersCount = successfulOrders.length;
  const successfulOrdersTotal = successfulOrders.reduce(
    (sum, order) => sum + (Number(order?.totalPrice) || 0),
    0,
  );

  const handleStatusChange = async (event) => {
    const nextStatus = event.target.value;
    if (!client?._id && !client?.id) return;

    const previousStatus = client?.status || "active";
    if (nextStatus === previousStatus) return;

    setUpdatingStatus(true);
    try {
      const clientId = client?._id || client?.id;
      const { ok, data } = await updateClientStatus(clientId, nextStatus);
      if (!ok) {
        throw new Error(data?.message || "Cập nhật trạng thái tài khoản khách hàng thất bại!");
      }

      setClient((prev) => ({ ...prev, ...(data?.data || {}), status: nextStatus }));
      toast.success(
        nextStatus === "inactive"
          ? "Khóa tài khoản khách hàng thành công!"
          : "Mở khóa tài khoản khách hàng thành công!",
      );
    } catch (error) {
      toast.error(error?.message || "Cập nhật trạng thái tài khoản khách hàng thất bại!");
    } finally {
      setUpdatingStatus(false);
    }
  };

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

    // fetch all orders for client so summary metrics are calculated globally
    fetch(`${pathAdmin}/admin/order?userId=${id}&limit=5000&page=1`, {
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
            <div className="text-sm text-gray-500">Trạng thái tài khoản</div>
            <select
              value={client?.status || "active"}
              onChange={handleStatusChange}
              disabled={updatingStatus}
              className="mt-[4px] min-w-[180px] rounded-[8px] border border-gray-300 bg-white px-[12px] py-[10px] text-[14px] font-[600] outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              {Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
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
            <div className="font-[700]">{clientOrders.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Tổng đơn giao thành công</div>
            <div className="font-[700]">{successfulOrdersCount}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Tổng số tiền đã mua</div>
            <div className="font-[700]">{formatMoney(successfulOrdersTotal)}</div>
          </div>
        </div>
        <div className="mt-4">
          <Link to="/admin/client" className="text-pri underline">Quay lại danh sách</Link>
        </div>
      </div>

      <div className="bg-[white] rounded-[20px] p-[24px] border border-gray-300">
        <div className="text-[18px] font-[700] mb-4">Danh sách đơn đã đặt</div>
        {clientOrders.length === 0 ? (
          <div className="text-gray-500">Không tìm thấy đơn hàng.</div>
        ) : (
          <div className="max-h-[560px] overflow-y-auto overflow-x-auto">
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
                {clientOrders.map((o) => (
                  <tr key={o._id}>
                    <td className="p-3 font-[700]">{o.orderCode || o._id}</td>
                    <td className="p-3">{formatMoney(o.totalPrice)}</td>
                    <td className="p-3">{formatOrderStatus(o.status)}</td>
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
