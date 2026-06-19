import { useEffect, useState } from "react";

import FilterBar from "../../../components/FilterBar";
import useFilter from "../../../hooks/useFilter";
import Pagination from "../../../components/Pagination";
import { CiSearch } from "react-icons/ci";
import { fetchOrders } from "../../../services/order.service";
import OrderModal from "./order-modal";
import {
  ADMIN_LIST_LIMIT,
  paginateItems,
  sortByCreatedDesc,
} from "../../../helpers/adminList";
import { pathAdmin } from "../../../config/api";

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đang chuẩn bị",
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

const RETURN_LABELS = {
  requested: "Chờ duyệt hoàn",
  approved: "Chờ nhận hàng hoàn",
  completed: "Đã hoàn thành",
  rejected: "Từ chối hoàn",
};

const isPaidOrder = (order) => {
  if (!order) return false;
  if (
    String(order?.payStatus || "")
      .trim()
      .toLowerCase() === "paid"
  )
    return true;
  if (Number(order?.payment?.capturedAmount) > 0) return true;
  if (String(order?.payment?.zpTransId || "").trim()) return true;
  return false;
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

  const {
    values: filterValues,
    handleChange: onFilterChange,
    reset: resetFilterValues,
  } = useFilter({
    defaultValues: {
      status: "",
      returnStatus: "",
      method: "",
      payStatus: "",
      dateRange: { start: "", end: "" },
    },
    onApply: () => setPage(1),
    debounce: 200,
  });
  const [exportLoading, setExportLoading] = useState(false);
  const status = filterValues.status;
  const returnStatus = filterValues.returnStatus;
  const method = filterValues.method;
  const payStatus = filterValues.payStatus;
  const startDate = filterValues.dateRange?.start || "";
  const endDate = filterValues.dateRange?.end || "";

  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState("");

  const resetFilters = () => {
    setKeyword("");
    resetFilterValues();
    setPage(1);
  };

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);

    (async () => {
      try {
        const data = await fetchOrders({
          keyword,
          status,
          method,
          payStatus,
          startDate,
          endDate,
          page: 1,
          limit: ADMIN_LIST_LIMIT,
          signal: controller.signal,
        });
        if (data?.code === "error")
          throw new Error(data.message || "Unauthorized");
        const allRows = sortByCreatedDesc(data?.data || []);
        const filteredRows = allRows.filter((item) => {
          if (!returnStatus) return true;
          const itemReturnStatus = String(
            item?.returnRequest?.status || "none",
          );
          return itemReturnStatus === returnStatus;
        });
        setRows(paginateItems(filteredRows, page, limit));
        setTotal(filteredRows.length);
        setTotalPage(Math.max(1, Math.ceil(filteredRows.length / limit)));
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("Fetch orders failed", err);
        alert(err?.message || "Failed to fetch");
        setRows([]);
        setTotal(0);
        setTotalPage(1);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [
    keyword,
    status,
    returnStatus,
    method,
    payStatus,
    startDate,
    endDate,
    page,
  ]);

  const openDetail = (id) => {
    setActiveId(id);
    setOpen(true);
  };

  const handleUpdated = (updated) => {
    if (!updated?._id) return;
    setRows((prev) =>
      prev.map((r) => (r._id === updated._id ? { ...r, ...updated } : r)),
    );
  };

  const handleExportExcel = async () => {
    try {
      setExportLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      if (keyword) params.append("keyword", keyword);
      if (status) params.append("status", status);
      if (method) params.append("method", method);
      if (payStatus) params.append("payStatus", payStatus);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(
        `${pathAdmin}/admin/order/export?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Không thể tải file excel từ server");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Danh_sach_don_hang_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export Excel failed", error);
      alert(error.message || "Lỗi khi xuất file Excel");
    } finally {
      setExportLoading(false);
    }
  };
  return (
    <>
      <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
        <div className="sm:text-[30px] text-[20px] font-[700] mb-[30px]">
          Quản lý đơn hàng
        </div>

        <FilterBar
          fields={[
            {
              name: "status",
              type: "select",
              options: [
                { label: "Tất cả trạng thái", value: "" },
                ...Object.keys(STATUS_LABELS).map((k) => ({
                  label: STATUS_LABELS[k],
                  value: k,
                })),
              ],
            },
            {
              name: "payStatus",
              type: "select",
              options: [
                { label: "Tất cả thanh toán", value: "" },
                ...Object.keys(PAY_LABELS).map((k) => ({
                  label: PAY_LABELS[k],
                  value: k,
                })),
              ],
            },
            {
              name: "returnStatus",
              type: "select",
              options: [
                { label: "Tất cả hoàn hàng", value: "" },
                { label: "Chưa có yêu cầu", value: "none" },
                ...Object.keys(RETURN_LABELS).map((k) => ({
                  label: RETURN_LABELS[k],
                  value: k,
                })),
              ],
            },
            {
              name: "method",
              type: "select",
              options: [
                { label: "Tất cả phương thức", value: "" },
                ...Object.keys(METHOD_LABELS).map((k) => ({
                  label: METHOD_LABELS[k],
                  value: k,
                })),
              ],
            },
            { name: "dateRange", type: "date-range" },
          ]}
          values={filterValues}
          onChange={(v) => {
            setPage(1);
            onFilterChange(v);
          }}
          onReset={resetFilters}
          card={true}
        />

        <div className="flex gap-[20px] items-center mt-[20px] flex-wrap">
          <div className="flex gap-[10px] items-center bg-[white] py-[20px] px-[20px] rounded-[10px] border border-gray-300">
            <CiSearch />
            <input
              className="placeholder:text-[14px] text-[14px] outline-none w-[300px]"
              placeholder="Tìm mã đơn / SĐT / tên khách hàng"
              defaultValue={keyword}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  setKeyword(e.target.value);
                }
              }}
            />
          </div>
          <button
            type="button"
            disabled={exportLoading}
            onClick={handleExportExcel}
            className={`flex items-center gap-[8px] bg-[#1d6f42] hover:bg-[#155231] text-white font-[700] text-[14px] px-[20px] py-[15px] rounded-[10px] transition-colors shadow-sm ${
              exportLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <div className="text-[16px]"></div>
            <span>{exportLoading ? "Đang xuất..." : "Xuất Excel"}</span>
          </button>
        </div>

        <div className="mt-[20px]">
          <div className="flex flex-col px-[30px] bg-[white] py-[30px] rounded-[20px]">
            <div className="overflow-x-auto">
              <table className="xl:w-full w-[1200px]">
                <thead className="bg-[#e5e1e1] ">
                  <tr>
                    <td className="p-[15px] text-[14px] font-[600] rounded-l-[10px] w-[220px]">
                      Đơn hàng
                    </td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[220px]">
                      Khách hàng
                    </td>
                    {/* <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[120px]">Số lượng</td> */}
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[160px]">
                      Tổng tiền
                    </td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[200px]">
                      Trạng thái
                    </td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[190px]">
                      Hoàn hàng
                    </td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[200px]">
                      Thanh toán
                    </td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[180px]">
                      Tạo lúc
                    </td>
                    <td className="p-[15px] text-[14px] font-[600] rounded-r-[10px] py-[10px] w-[140px]">
                      Hành động
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="p-[15px] text-[14px] text-gray-500"
                      >
                        Đang tải...
                      </td>
                    </tr>
                  ) : rows.length ? (
                    rows.map((o) => (
                      <tr key={o._id}>
                        <td className="p-[15px] text-[14px]">
                          <div className="font-[800]">
                            {o.orderCode || o._id}
                          </div>
                          <div className="text-[12px] text-gray-500 break-all">
                            {o._id}
                          </div>
                        </td>
                        <td className="p-[15px] text-[14px]">
                          <div className="font-[700]">
                            {o?.userId?.fullName || o?.fullName || "(Chưa có)"}
                          </div>
                          <div className="text-[12px] text-gray-500">
                            {o?.userId?.email || o?.email || ""}
                          </div>
                          <div className="text-[12px] text-gray-500">
                            {o?.userId?.phone || o?.phone || ""}
                          </div>
                        </td>

                        {/* <td className="p-[15px] text-[14px]">{o.itemsCount ?? (o.cart || []).length}</td> */}
                        <td className="p-[15px] text-[14px] font-[800]">
                          {formatMoney(o.totalPrice)}
                        </td>
                        <td className="p-[15px] text-[14px]">
                          <span
                            className={`px-2 py-1 rounded text-xs font-[700] ${badgeClass("status", o.status)}`}
                          >
                            {STATUS_LABELS[o.status] || o.status}
                          </span>
                        </td>
                        <td className="p-[15px] text-[14px]">
                          {o?.returnRequest?.status === "requested" ? (
                            <span className="px-2 py-1 rounded text-xs font-[700] bg-orange-100 text-orange-800">
                              {RETURN_LABELS.requested}
                            </span>
                          ) : o?.returnRequest?.status === "approved" ? (
                            <span className="px-2 py-1 rounded text-xs font-[700] bg-green-100 text-green-800">
                              {RETURN_LABELS.approved}
                            </span>
                          ) : o?.returnRequest?.status === "completed" ? (
                            <span className="px-2 py-1 rounded text-xs font-[700] bg-emerald-100 text-emerald-800">
                              {RETURN_LABELS.completed}
                            </span>
                          ) : o?.returnRequest?.status === "rejected" ? (
                            <span className="px-2 py-1 rounded text-xs font-[700] bg-red-100 text-red-800">
                              {RETURN_LABELS.rejected}
                            </span>
                          ) : (
                            <span className="text-[12px] text-gray-400">
                              Không có
                            </span>
                          )}
                        </td>
                        <td className="p-[15px] text-[14px]">
                          {(() => {
                            const inferred = isPaidOrder(o) ? "paid" : "unpaid";
                            return (
                              <span
                                className={`px-2 py-1 rounded text-xs font-[700] ${badgeClass("pay", inferred)}`}
                              >
                                {PAY_LABELS[inferred] || inferred}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="p-[15px] text-[14px]">
                          {formatDateTime(o.createdAt)}
                        </td>
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
                      <td colSpan="9">
                        <div className="flex items-center justify-center gap-[10px] py-[30px] text-[14px] text-gray-500">
                          <CiSearch className="md:text-[20px] text-[18px]" />

                          <span className="md:text-[16px] text-[14px]">
                            Không tìm thấy đơn hàng
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Pagination
          page={page}
          totalPage={totalPage}
          total={total}
          limit={limit}
          onChange={setPage}
        />
      </div>

      <OrderModal
        open={open}
        orderId={activeId}
        onClose={() => setOpen(false)}
        onUpdated={handleUpdated}
      />
    </>
  );
}
