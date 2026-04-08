import { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { pathAdmin } from "../../../config/api";
import OrderModal from "./order-modal";

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

const formatDateTime = (date) => {
  if (!date) return "";
  try {
    return new Date(date).toLocaleString("vi-VN");
  } catch {
    return String(date);
  }
};

const badgeClass = (type, value) => {
  if (type === "status") {
    if (value === "pending") return "bg-yellow-100 text-yellow-800";
    if (value === "confirmed") return "bg-blue-100 text-blue-800";
    if (value === "shipping") return "bg-purple-100 text-purple-800";
    if (value === "delivered") return "bg-green-100 text-green-800";
    if (value === "cancelled") return "bg-red-100 text-red-800";
  }
  if (type === "pay") {
    if (value === "paid") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-700";
  }
  return "bg-gray-100 text-gray-700";
};

export default function OrderList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("");
  const [payStatus, setPayStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState("");

  const resetFilters = () => {
    setKeyword("");
    setStatus("");
    setMethod("");
    setPayStatus("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const controller = new AbortController();

    setLoading(true);
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);
    if (status) params.append("status", status);
    if (method) params.append("method", method);
    if (payStatus) params.append("payStatus", payStatus);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    params.append("page", String(page));
    params.append("limit", String(limit));

    fetch(`${pathAdmin}/admin/order?${params.toString()}`, {
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
        setRows(data?.data || []);
        setTotal(data?.total || 0);
        setTotalPage(data?.totalPage || 1);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        console.error("Fetch orders failed", err);
        alert(err?.message || "Failed to fetch");
        setRows([]);
        setTotal(0);
        setTotalPage(1);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [keyword, status, method, payStatus, startDate, endDate, page]);

  const openDetail = (id) => {
    setActiveId(id);
    setOpen(true);
  };

  const handleUpdated = (updated) => {
    if (!updated?._id) return;
    setRows((prev) => prev.map((r) => (r._id === updated._id ? { ...r, ...updated } : r)));
  };

  return (
    <>
      <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
        <div className="sm:text-[30px] text-[20px] font-[700] mb-[30px]">Quản lý đơn hàng</div>

        <div className="flex w-full overflow-x-auto bg-[white] rounded-[10px] border-[1px] border-gray-300">
          <div className="flex items-center gap-0 min-w-max">
            <div className="py-[15px] px-[20px] flex gap-[5px] items-center border-r-[1px] border-r-gray-300">
              <FaFilter className="text-[16px]" />
              <span className="font-[700] text-[13px] whitespace-nowrap">Bộ lọc</span>
            </div>
            <div className="py-[15px] px-[15px] border-r-[1px] border-r-gray-300">
              <select
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
                className="font-[700] outline-none text-[12px] w-[160px]"
              >
                <option value="">Tất cả trạng thái</option>
                {Object.keys(STATUS_LABELS).map((k) => (
                  <option key={k} value={k}>
                    {STATUS_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
            <div className="py-[15px] px-[15px] border-r-[1px] border-r-gray-300">
              <select
                value={payStatus}
                onChange={(e) => {
                  setPage(1);
                  setPayStatus(e.target.value);
                }}
                className="font-[700] outline-none text-[12px] w-[170px]"
              >
                <option value="">Tất cả thanh toán</option>
                {Object.keys(PAY_LABELS).map((k) => (
                  <option key={k} value={k}>
                    {PAY_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
            <div className="py-[15px] px-[15px] border-r-[1px] border-r-gray-300">
              <select
                value={method}
                onChange={(e) => {
                  setPage(1);
                  setMethod(e.target.value);
                }}
                className="font-[700] outline-none text-[12px] w-[140px]"
              >
                <option value="">Tất cả phương thức</option>
                {Object.keys(METHOD_LABELS).map((k) => (
                  <option key={k} value={k}>
                    {METHOD_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
            <div className="py-[15px] px-[15px] border-r-[1px] border-r-gray-300 flex items-center gap-[8px]">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setPage(1);
                  setStartDate(e.target.value);
                }}
                className="font-[700] text-[12px] outline-none w-[120px]"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setPage(1);
                  setEndDate(e.target.value);
                }}
                className="font-[700] text-[12px] outline-none w-[120px]"
              />
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="py-[15px] px-[15px] flex gap-[5px] items-center text-[red] font-[700] text-[13px] hover:opacity-70 whitespace-nowrap"
            >
              <MdDelete className="text-[14px]" />
              <span>Xóa lọc</span>
            </button>
          </div>
        </div>

        <div className="flex gap-[20px] items-center mt-[20px] flex-wrap">
          <div className="flex gap-[10px] items-center bg-[white] py-[20px] px-[20px] rounded-[10px] border border-gray-300">
            <CiSearch />
            <input
              className="placeholder:text-[14px] text-[14px] outline-none w-[300px]"
              placeholder="Tìm mã đơn / SĐT / địa chỉ"
              defaultValue={keyword}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  setKeyword(e.target.value);
                }
              }}
            />
          </div>
        </div>

        <div className="mt-[20px]">
          <div className="flex flex-col px-[30px] bg-[white] py-[30px] rounded-[20px]">
            <div className="overflow-x-auto">
              <table className="xl:w-full w-[1200px]">
                <thead className="bg-[#e5e1e1] ">
                  <tr>
                    <td className="p-[15px] text-[14px] font-[600] rounded-l-[10px] w-[260px]">Đơn hàng</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[260px]">Khách hàng</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[120px]">Số lượng</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[160px]">Tổng tiền</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[170px]">Trạng thái</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[170px]">Thanh toán</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[180px]">Tạo lúc</td>
                    <td className="p-[15px] text-[14px] font-[600] rounded-r-[10px] py-[10px] w-[140px]">Hành động</td>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="p-[15px] text-[14px] text-gray-500">
                        Đang tải...
                      </td>
                    </tr>
                  ) : rows.length ? (
                    rows.map((o) => (
                      <tr key={o._id}>
                        <td className="p-[15px] text-[14px]">
                          <div className="font-[800]">{o.orderCode || o._id}</div>
                          <div className="text-[12px] text-gray-500 break-all">{o._id}</div>
                        </td>
                        <td className="p-[15px] text-[14px]">
                          <div className="font-[700]">{o?.userId?.fullName || "(Chưa có)"}</div>
                          <div className="text-[12px] text-gray-500">{o?.userId?.email || ""}</div>
                          <div className="text-[12px] text-gray-500">{o?.userId?.phone || o.phone || ""}</div>
                        </td>
                        <td className="p-[15px] text-[14px]">{o.itemsCount ?? (o.cart || []).length}</td>
                        <td className="p-[15px] text-[14px] font-[800]">{formatMoney(o.totalPrice)}</td>
                        <td className="p-[15px] text-[14px]">
                          <span className={`px-2 py-1 rounded text-xs font-[700] ${badgeClass("status", o.status)}`}>
                            {STATUS_LABELS[o.status] || o.status}
                          </span>
                        </td>
                        <td className="p-[15px] text-[14px]">
                          <span className={`px-2 py-1 rounded text-xs font-[700] ${badgeClass("pay", o.payStatus)}`}>
                            {PAY_LABELS[o.payStatus] || o.payStatus}
                          </span>
                        </td>
                        <td className="p-[15px] text-[14px]">{formatDateTime(o.createdAt)}</td>
                        <td className="p-[15px]">
                          <button
                            type="button"
                            onClick={() => openDetail(o._id)}
                            className="rounded-[10px] text-[14px] px-[14px] py-[12px] bg-[white] border border-gray-300 hover:bg-gray-50"
                          >
                            Xem
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8">
                        <div className="flex items-center justify-center gap-[10px] py-[30px] text-[14px] text-gray-500">
                          <CiSearch className="md:text-[20px] text-[18px]" />
                          <span className="md:text-[16px] text-[14px]">Không có đơn hàng</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-[30px] flex items-center gap-[10px] text-[14px]">
          {total > 0 ? (
            <>
              <span>
                Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, total)} của {total}
              </span>
              <div className="bg-[white] p-[7px] rounded-[10px] border border-gray-300">
                <select
                  className="outline-none border-none bg-transparent focus:ring-0"
                  value={page}
                  onChange={(e) => setPage(Number(e.target.value))}
                >
                  {[...Array(totalPage)].map((_, i) => (
                    <option key={i} value={i + 1}>
                      Trang {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <OrderModal open={open} orderId={activeId} onClose={() => setOpen(false)} onUpdated={handleUpdated} />
    </>
  );
}
