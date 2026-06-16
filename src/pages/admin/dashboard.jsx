// import { useEffect, useRef, useState } from "react";
// import { fetchAdminUser, pathAdmin } from "../../config/api";
// export default function DashboardNew() {
//   const [dashboard, setDashboard] = useState({
//     totalClient: 0,
//     totalProduct: 0,
//     dashboard: { order: 0, priceTotal: 0 },
//     categoryList: [],
//     almostOver: 0,
//     soldOut: 0,
//     many: 0,
//     topProduct: [],
//     orderNew: [],
//   });
//   const [loading, setLoading] = useState(true);
//   const [permissions, setPermissions] = useState([]);

//   const [chartLoaded, setChartLoaded] = useState(false);
//   const canViewStatistics = permissions.includes("statistics-view");

//   const [revenueMonth, setRevenueMonth] = useState(() => {
//     const now = new Date();
//     const y = now.getFullYear();
//     const m = String(now.getMonth() + 1).padStart(2, "0");
//     return `${y}-${m}`;
//   });

//   const [inventoryCategory, setInventoryCategory] = useState(() => {
//     const url = new URL(window.location.href);
//     return url.searchParams.get("category") || "";
//   });

//   // Date filter state
//   const [dateFilterType, setDateFilterType] = useState("month"); // "range", "week", "month", "year"
//   const [startDate, setStartDate] = useState(() => {
//     const now = new Date();
//     const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
//     return monthAgo.toISOString().split("T")[0];
//   });
//   const [endDate, setEndDate] = useState(() => {
//     const now = new Date();
//     return now.toISOString().split("T")[0];
//   });

//   const revenueChartInstanceRef = useRef(null);
//   const inventoryChartInstanceRef = useRef(null);
//   const formatPrice = (value) =>
//     Number(value || 0).toLocaleString("vi-VN") + "đ";
//   const getStatusBadge = (status) => {
//     if (status === "initial")
//       return { label: "Khởi tạo", cls: "bg-[#FFEEDD] text-[#FFA956]" };
//     if (status === "ship")
//       return { label: "Đang giao", cls: "bg-[#DDEBFF] text-[#3B82F6]" };
//     if (status === "done")
//       return { label: "Đã giao", cls: "bg-[#DDFFEE] text-[#10B981]" };
//     return { label: "Đã hủy", cls: "bg-[#FEE2E2] text-[#EF4444]" };
//   };
//   useEffect(() => {
//     const cacheRaw = sessionStorage.getItem("admin_profile_cache");
//     if (cacheRaw) {
//       try {
//         const parsed = JSON.parse(cacheRaw);
//         if (Array.isArray(parsed?.permissions)) {
//           setPermissions(parsed.permissions);
//         }
//       } catch {
//         // noop
//       }
//     }

//     ;(async () => {
//       try {
//         const resp = await fetchAdminUser();
//         const nextPermissions = Array.isArray(resp?.data?.data?.permissions)
//           ? resp.data.data.permissions
//           : [];
//         setPermissions(nextPermissions);
//         sessionStorage.setItem("admin_profile_cache", JSON.stringify({ permissions: nextPermissions }));
//       } catch (err) {
//         // noop
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     setLoading(true);
//     fetch(`${pathAdmin}/admin/dashboard`, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "ngrok-skip-browser-warning": "true",
//       },
//       credentials: "include",
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         const payload = data?.data || {};
//         setDashboard({
//           ...payload,
//           topProduct: payload?.topProduct || [],
//         });
//         console.log(dashboard);
//       })
//       .catch(() => setDashboard({}))
//       .finally(() => setLoading(false));
//   }, []);

//   useEffect(() => {
//     if (!canViewStatistics) return;
//     const ensureChartJs = async () => {
//       if (window.Chart) return;

//       const existing = document.querySelector('script[data-chartjs="true"]');
//       if (existing) return;

//       await new Promise((resolve, reject) => {
//         const script = document.createElement("script");
//         script.src = "https://cdn.jsdelivr.net/npm/chart.js";
//         script.async = true;
//         script.dataset.chartjs = "true";
//         script.onload = () => resolve();
//         script.onerror = () => reject(new Error("Failed to load chart.js"));
//         document.body.appendChild(script);
//       });
//     };

//     ensureChartJs()
//       .then(() => setChartLoaded(true))
//       .catch(() => setChartLoaded(false));
//   }, [canViewStatistics]);

//   useEffect(() => {
//     if (!inventoryCategory && (dashboard?.categoryList || []).length) {
//       setInventoryCategory(dashboard.categoryList[0].id);
//     }
//   }, [dashboard?.categoryList, inventoryCategory]);

//   // Biểu đồ doanh thu
//   useEffect(() => {
//     if (!canViewStatistics) return;
//     if (!chartLoaded) return;
//     const revenueCanvas = document.getElementById("revenue-chart");
//     if (!revenueCanvas) return;

//     const token = localStorage.getItem("token");
//     const [yearStr, monthStr] = String(revenueMonth).split("-");
//     const currentYear = Number(yearStr);
//     const currentMonth = Number(monthStr); 
//     if (!currentYear || !currentMonth) return;

//     const previousDate = new Date(currentYear, currentMonth - 2, 1);
//     const previousYear = previousDate.getFullYear();
//     const previousMonth = previousDate.getMonth() + 1;

//     const daysInCurrent = new Date(currentYear, currentMonth, 0).getDate();
//     const daysInPrevious = new Date(previousYear, previousMonth, 0).getDate();
//     const days = Math.max(daysInCurrent, daysInPrevious);

//     const arrayDay = [];
//     for (let i = 1; i <= days; i++) arrayDay.push(i);

//     fetch(`${pathAdmin}/admin/dashboard/revenueChart`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//         "ngrok-skip-browser-warning": "true",
//       },
//       body: JSON.stringify({
//         currentMonth,
//         currentYear,
//         previousMonth,
//         previousYear,
//         arrayDay,
//       }),
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         const dataMonthCurrent = data?.dataMonthCurrent || [];
//         const dataMonthPrevious = data?.dataMonthPrevious || [];

//         if (revenueChartInstanceRef.current) {
//           revenueChartInstanceRef.current.destroy();
//         }

//         const labels = arrayDay;
//         const ctx = revenueCanvas.getContext("2d");
//         revenueChartInstanceRef.current = new window.Chart(ctx, {
//           type: "line",
//           data: {
//             labels,
//             datasets: [
//               {
//                 label: `Tháng ${currentMonth}/${currentYear}`,
//                 data: dataMonthCurrent,
//                 borderColor: "#4379EE",
//                 borderWidth: 1.5,
//               },
//               {
//                 label: `Tháng ${previousMonth}/${previousYear}`,
//                 data: dataMonthPrevious,
//                 borderColor: "#EF3826",
//                 borderWidth: 1.5,
//               },
//             ],
//           },
//           options: {
//             plugins: {
//               legend: { position: "bottom" },
//             },
//             scales: {
//               x: {
//                 title: { display: true, text: "Ngày" },
//                 ticks: { maxRotation: 0, minRotation: 0 },
//               },
//               y: {
//                 title: { display: true, text: "Doanh thu (VND)" },
//               },
//             },
//             maintainAspectRatio: false,
//           },
//         });
//       })
//       .catch(() => {});
//   }, [chartLoaded, revenueMonth, canViewStatistics]);

//     // Biểu đồ tồn kho
//     useEffect(() => {
//         if (!canViewStatistics) return;
//         if (!chartLoaded) return;
//         const inventoryCanvas = document.getElementById("inventoryChart");
//         if (!inventoryCanvas) return;

//         const token = localStorage.getItem("token");

//         fetch(
//         `${pathAdmin}/admin/dashboard/inventory?category=${encodeURIComponent(inventoryCategory || "")}`,
//         {
//             method: "GET",
//             headers: {
//             Authorization: `Bearer ${token}`,
//             "ngrok-skip-browser-warning": "true",
//             },
//         }
//         )
//         .then((res) => res.json())
//         .then((data) => {
//             const result = data?.result || [];
//             const labels = result.map((c) => c.name);
//             const dataCounts = result.map((c) => c.count);
//             const baseWidth = 700;
//             const perBarWidth = 130;
//             inventoryCanvas.width = Math.max(baseWidth, labels.length * perBarWidth);
//             inventoryCanvas.height = 270;

//             const colors = labels.map(
//             () =>
//                 `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
//                 Math.random() * 255
//                 )}, ${Math.floor(Math.random() * 255)}, 0.6)`
//             );

//             if (inventoryChartInstanceRef.current) {
//             inventoryChartInstanceRef.current.destroy();
//             }

//             const ctx = inventoryCanvas.getContext("2d");
//             inventoryChartInstanceRef.current = new window.Chart(ctx, {
//             type: "bar",
//             data: {
//                 labels,
//                 datasets: [
//                 {
//                     label: "Số lượng tồn kho",
//                     data: dataCounts,
//                     backgroundColor: colors,
//                     borderColor: colors.map((c) => c.replace("0.6", "1")),
//                     borderWidth: 1,
//                 },
//                 ],
//             },
//             options: {
//                 responsive: true,
//                 plugins: { legend: { position: "bottom" } },
//                 scales: {
//                 x: {
//                     title: { display: true, text: "Thể loại" },
//                     ticks: {
//                     maxRotation: 0,
//                     minRotation: 0,
//                     autoSkip: false,
//                     },
//                 },
//                 y: {
//                     title: { display: true, text: "Số lượng tồn kho" },
//                     beginAtZero: true,
//                 },
//                 },
//                 maintainAspectRatio: false,
//             },
//             });
//         })
//         .catch(() => {});
//     }, [chartLoaded, inventoryCategory, canViewStatistics]);

//   return (
//     <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
//       <div className="w-full grid xl:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-y-[20px] xl:gap-x-[40px] gap-x-[20px] md:px-[30px] px-[16px]">
//         <div className="bg-[white] flex items-center gap-[20px] justify-center py-[20px] rounded-[20px]">
//           <img src="/image/user.png" className="w-[70px]" alt="" />
//           <div className="flex flex-col">
//             <span className="text-[14px] font-[500]">Khách hàng</span>
//             <span className="md:text-[26px] text-[20px] text-[var(--pri)] font-[700]">
//               {dashboard.totalClient ?? 0}
//             </span>
//           </div>
//         </div>
//         <div className="bg-[white] flex items-center gap-[20px] justify-center py-[20px] rounded-[20px]">
//           <img src="/image/order.png" className="w-[70px]" alt="" />
//           <div className="flex flex-col">
//             <span className="text-[14px] font-[500]">Đơn hàng</span>
//             <span className="md:text-[26px] text-[20px] text-[var(--pri)] font-[700]">
//               {dashboard.dashboard?.order ?? 0}
//             </span>
//           </div>
//         </div>
//         <div className="bg-[white] flex items-center gap-[20px] justify-center py-[20px] rounded-[20px]">
//           <img src="/image/revenue.png" className="w-[70px]" alt="" />
//           <div className="flex flex-col">
//             <span className="text-[14px] font-[500]">Doanh thu</span>
//             <span className="md:text-[26px] text-[20px] text-[var(--pri)] font-[700]">
//               {formatPrice(dashboard.dashboard?.priceTotal ?? 0)}
//             </span>
//           </div>
//         </div>
//         <div className="bg-[white] flex items-center gap-[20px] justify-center py-[20px] rounded-[20px]">
//           <img src="/image/revenue.png" className="w-[70px]" alt="" />
//           <div className="flex flex-col">
//             <span className="text-[14px] font-[500]">Tổng số sản phẩm</span>
//             <span className="md:text-[26px] text-[20px] text-[var(--pri)] font-[700]">
//               {dashboard.totalProduct ?? 0}
//             </span>
//           </div>
//         </div>
//       </div>

//       {canViewStatistics ? (
//         <>
//           {/* Section 2: Biểu đồ doanh thu */}
//           <div className="md:px-[30px] px-[16px] mt-[20px] py-[20px]">
//             <div className="flex flex-col px-[30px] bg-[white] py-[30px] rounded-[20px]">
//               <div className="flex items-center justify-between mb-[20px]">
//                 <div className="text-[23px] font-[700]">Biểu đồ doanh thu</div>
//                 <input
//                   type="month"
//                   name=""
//                   chart="true"
//                   value={revenueMonth}
//                   onChange={(e) => setRevenueMonth(e.target.value)}
//                   className="bg-[#F3F4F6] px-[12px] py-[8px] rounded-[10px] text-[14px]"
//                 />
//               </div>
//               <div className="overflow-x-auto">
//                 <canvas id="revenue-chart" style={{ height: "250px" }} />
//               </div>
//             </div>
//           </div>

//           {/* Section 2: Thống kê tồn kho */}
//           <div className="md:px-[30px] px-[16px] mt-[20px] py-[20px]">
//             <div className="flex flex-col px-[30px] bg-[white] py-[30px] rounded-[20px]">
//               <div className="text-[23px] font-[700] mb-[15px]">Thống kê tồn kho</div>

//               <div className="flex flex-wrap gap-[10px] mb-[15px]">
//                 {(dashboard.categoryList || []).map((item) => (
//                   <span
//                     key={item.id}
//                     inventory-id={item.id}
//                     className={`cursor-pointer text-[14px] font-[600] px-[10px] py-[6px] rounded-[999px] ${inventoryCategory === item.id ? "bg-pri text-white" : "bg-[#F3F4F6]"}`}
//                     onClick={() => {
//                       const url = new URL(window.location.href);
//                       if (item.id) url.searchParams.set("category", item.id);
//                       window.history.replaceState({}, "", url);
//                       setInventoryCategory(item.id);
//                     }}
//                   >
//                     {item.name}
//                   </span>
//                 ))}
//               </div>

//               <div className="overflow-x-auto">
//                 <canvas id="inventoryChart" style={{ height: "300px", width: "auto" }} />
//               </div>
//             </div>
//           </div>

//           {/* Section 2:  Top sp */}
//           <div className="md:px-[30px] px-[16px] mt-[20px] py-[20px]">
//             <div className="flex flex-col px-[30px] bg-[white] py-[30px] rounded-[20px]">
//             <div className="text-[23px] font-[700] mb-[15px]">Top sản phẩm bán chạy</div>

//             <div className="overflow-x-auto">
//                 <table className="w-full">
//                 <thead className="bg-[#e5e1e1]">
//                     <tr>
//                     <td className="p-[15px] text-[14px] font-[600] w-[60px] rounded-l-[10px]">STT</td>
//                     <td className="p-[15px] text-[14px] font-[600] w-[170px]">Tên sản phẩm</td>
//                     <td className="p-[15px] text-[14px] font-[600] w-[100px]">Đã bán</td>
//                     <td className="p-[15px] text-[14px] font-[600] w-[170px] rounded-r-[10px]">Doanh thu</td>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {(dashboard.topProduct || []).length ? (
//                         dashboard.topProduct.map((item, index) => (
//                             <tr key={index} className="border-b border-gray-300">
//                             <td className="p-[15px] text-[14px] font-[700] text-[var(--pri)]">
//                                 {index + 1}
//                             </td>
//                             <td className="p-[15px] text-[14px]">{item.name}</td>
//                             <td className="p-[15px] text-[14px] ">{item.sold}</td>
//                             <td className="p-[15px] text-[14px]">{formatPrice(item.profit)}</td>
//                             </tr>
//                         ))
//                     ) : (
//                     <tr>
//                         <td colSpan={4} className="p-[15px] text-[14px] ">
//                         Chưa có dữ liệu
//                         </td>
//                     </tr>
//                     )}
//                 </tbody>
//                 </table>
//             </div>
//             </div>

//           </div>
//         </>
//       ) : null}

//       {/* Section 3: Đơn hàng mới */}
//       <div className="md:px-[30px] px-[16px] mt-[20px] py-[20px]">
//         <div className="flex flex-col px-[30px] bg-[white] py-[30px] rounded-[20px]">
//           <div className="mb-[20px] text-[23px] font-[700]">Đơn hàng mới</div>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-[#e5e1e1]">
//                 <tr>
//                   <td className="p-[15px] text-[14px] font-[600] rounded-l-[10px]">Mã</td>
//                   <td className="p-[15px] text-[14px] font-[600] py-[10px]">Thông tin khách</td>
//                   <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[400px]">Danh sách sản phẩm</td>
//                   <td className="p-[15px] text-[14px] font-[600] py-[10px]">Thanh toán</td>
//                   <td className="p-[15px] text-[14px] font-[600] py-[10px]">Trạng thái</td>
//                   <td className="p-[15px] text-[14px] font-[600] rounded-r-[10px] py-[10px]">Ngày đặt</td>
//                 </tr>
//               </thead>
//               <tbody>
//                 {(dashboard.orderNew || []).length ? (
//                   dashboard.orderNew.map((item, index) => {
//                     const badge = getStatusBadge(item.status);
//                     return (
//                       <tr key={index} className="border-b border-gray-300">
//                         <td className="font-[700] text-[var(--pri)] p-[15px] text-[14px] w-[100px]">
//                           {item.orderCode}
//                         </td>
//                         <td className="p-[15px] text-[14px]">
//                           <div className="w-[150px]">{item.fullName}</div>
//                           <div>SĐT: {item.phone}</div>
//                           <div>Địa chỉ: {item.note}</div>
//                         </td>
//                         <td className="p-[15px] flex flex-col gap-y-[10px] w-[300px]">
//                           {(item.cart).map((it, i2) => (
//                             <div key={i2} className="flex items-center gap-[10px]">
//                               <img
//                                 className="rounded-[10px] w-[120px] h-[80px] object-cover bg-gray-100"
//                                 src={it.avatar || ""}
//                                 alt=""
//                               />
//                               <div className="flex flex-col">
//                                 <div className="text-[14px]">{it.name}</div>
//                                 <div className="text-[12px]">
//                                   Số lượng: {it.quantity} x {formatPrice(it.priceLast)}
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </td>
//                         <td className="p-[15px] text-[14px] w-[220px]">
//                           <div>Tổng tiền: {formatPrice(item.priceTotal)}</div>
//                           <div>PTTT: {item.nameMethod}</div>
//                           <div>TTTT: {item.nameStatusPay}</div>
//                         </td>
//                         <td className="p-[15px] w-[170px] pr-[25px]">
//                           <div
//                             className={`w-[120px] ${badge.cls} text-[14px] font-[700] text-center py-[10px] rounded-[10px]`}
//                           >
//                             {badge.label}
//                           </div>
//                         </td>
//                         <td className="p-[15px]">
//                           <div className="text-[14px]">{item.formatTime}</div>
//                           <div className="text-[14px]">{item.formatDay}</div>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 ) : (
//                   <tr>
//                     <td colSpan={6} className="p-[15px] text-center text-[14px]">
//                       {loading ? "Đang tải..." : "Chưa có đơn hàng mới"}
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { fetchAdminUser, pathAdmin } from "../../config/api";
import * as XLSX from "xlsx";

export default function DashboardNew() {
  const [dashboard, setDashboard] = useState({
    totalClient: 0,
    totalProduct: 0,
    dashboard: { order: 0, priceTotal: 0 },
    categoryList: [],
    almostOver: 0,
    soldOut: 0,
    many: 0,
    topProduct: [],
    orderNew: [],
  });
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [chartLoaded, setChartLoaded] = useState(false);
  const canViewStatistics = permissions.includes("statistics-view");
  const [revenueChartData, setRevenueChartData] = useState(null);
  const [inventoryCategory, setInventoryCategory] = useState(() => {
    const url = new URL(window.location.href);
    return url.searchParams.get("category") || "";
  });

  const [dateFilterType, setDateFilterType] = useState("month"); 
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]; 
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0]; 
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    return String(new Date().getFullYear());
  });

  const [productSearch, setProductSearch] = useState("");

  const revenueChartInstanceRef = useRef(null);
  const inventoryChartInstanceRef = useRef(null);

  const formatPrice = (value) => Number(value || 0).toLocaleString("vi-VN") + "đ";

  const getStatusBadge = (status) => {
    if (status === "initial") return { label: "Khởi tạo", cls: "bg-[#FFEEDD] text-[#FFA956]" };
    if (status === "ship") return { label: "Đang giao", cls: "bg-[#DDEBFF] text-[#3B82F6]" };
    if (status === "done") return { label: "Đã giao", cls: "bg-[#DDFFEE] text-[#10B981]" };
    return { label: "Đã hủy", cls: "bg-[#FEE2E2] text-[#EF4444]" };
  };

  const exportToExcel = (data, fileName, sheetName = "Sheet1") => {
    if (!data || data.length === 0) {
      alert("Không có dữ liệu để xuất file!");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}_${new Date().getTime()}.xlsx`);
  };

  // 1. Lấy quyền User
  useEffect(() => {
    const cacheRaw = sessionStorage.getItem("admin_profile_cache");
    if (cacheRaw) {
      try {
        const parsed = JSON.parse(cacheRaw);
        if (Array.isArray(parsed?.permissions)) setPermissions(parsed.permissions);
      } catch { /* noop */ }
    }

    (async () => {
      try {
        const resp = await fetchAdminUser();
        const nextPermissions = Array.isArray(resp?.data?.data?.permissions) ? resp.data.data.permissions : [];
        setPermissions(nextPermissions);
        sessionStorage.setItem("admin_profile_cache", JSON.stringify({ permissions: nextPermissions }));
      } catch (err) { /* noop */ }
    })();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);

    let startParam = "";
    if (dateFilterType === "range") startParam = startDate;
    else if (dateFilterType === "month") startParam = selectedMonth;
    else if (dateFilterType === "year") startParam = selectedYear;

    const queryParams = new URLSearchParams({
      filterType: dateFilterType,
      startDate: startParam,
      endDate: dateFilterType === "range" ? endDate : "",
      productSearch: productSearch, 
    }).toString();

    fetch(`${pathAdmin}/admin/dashboard?${queryParams}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const payload = data?.data || {};
        setDashboard({
          ...payload,
          topProduct: payload?.topProduct || [],
          orderNew: payload?.orderNew || [],
        });
      })
      .catch(() => setDashboard({}))
      .finally(() => setLoading(false));
  }, [dateFilterType, startDate, endDate, selectedMonth, selectedYear, productSearch]);

  useEffect(() => {
    if (!canViewStatistics) return;
    const ensureChartJs = async () => {
      if (window.Chart) return;
      const existing = document.querySelector('script[data-chartjs="true"]');
      if (existing) return;

      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/chart.js";
        script.async = true;
        script.dataset.chartjs = "true";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load chart.js"));
        document.body.appendChild(script);
      });
    };

    ensureChartJs()
      .then(() => setChartLoaded(true))
      .catch(() => setChartLoaded(false));
  }, [canViewStatistics]);

  useEffect(() => {
    if (!inventoryCategory && (dashboard?.categoryList || []).length) {
      setInventoryCategory(dashboard.categoryList[0].id);
    }
  }, [dashboard?.categoryList, inventoryCategory]);

  // 4. Biểu đồ doanh thu
  useEffect(() => {
    if (!canViewStatistics || !chartLoaded) return;
    const revenueCanvas = document.getElementById("revenue-chart");
    if (!revenueCanvas) return;

    const token = localStorage.getItem("token");
    let startParam = "";
    if (dateFilterType === "range") startParam = startDate;
    else if (dateFilterType === "month") startParam = selectedMonth;
    else if (dateFilterType === "year") startParam = selectedYear;

    fetch(`${pathAdmin}/admin/dashboard/revenueChart`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        filterType: dateFilterType,
        startDate: startParam,
        endDate: dateFilterType === "range" ? endDate : "",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setRevenueChartData(data);
        if (revenueChartInstanceRef.current) {
          revenueChartInstanceRef.current.destroy();
        }

        const ctx = revenueCanvas.getContext("2d");
        revenueChartInstanceRef.current = new window.Chart(ctx, {
          type: "bar",
          data: {
            labels: data.labels || [],
            datasets: [
              {
                label: data.labelCurrent || "Doanh thu kỳ này",
                data: data.dataMonthCurrent || [],
                backgroundColor: "#4379EE",
                borderColor: "#4379EE",
                borderWidth: 1,
                borderRadius: 4,
              },
            ],
          },
          options: {
            plugins: { legend: { position: "bottom" } },
            scales: {
              x: { title: { display: true, text: "Thời gian thống kê" } },
              y: { title: { display: true, text: "Doanh thu (VND)" }, beginAtZero: true },
            },
            maintainAspectRatio: false,
          },
        });
      })
      .catch((err) => console.error("Lỗi vẽ biểu đồ:", err));
  }, [chartLoaded, dateFilterType, startDate, endDate, selectedMonth, selectedYear, canViewStatistics]);
  const handleExportRevenue = () => {
    if (!revenueChartData || !revenueChartData.labels || revenueChartData.labels.length === 0) {
      alert("Không có dữ liệu doanh thu biểu đồ để xuất!");
      return;
    }

    // Khớp mảng labels (Trục X) với dữ liệu doanh thu (Trục Y) thành dạng dòng dữ liệu
    const formattedData = revenueChartData.labels.map((label, idx) => ({
      "Thời gian": label,
      "Doanh thu (VND)": revenueChartData.dataMonthCurrent?.[idx] || 0
    }));

    exportToExcel(formattedData, "Bao_Cao_Doanh_Thu_Bieu_Do", "Doanh thu");
  };
  // 5. Biểu đồ tồn kho
  useEffect(() => {
    if (!canViewStatistics || !chartLoaded) return;
    const inventoryCanvas = document.getElementById("inventoryChart");
    if (!inventoryCanvas) return;

    const token = localStorage.getItem("token");

    fetch(`${pathAdmin}/admin/dashboard/inventory?category=${encodeURIComponent(inventoryCategory || "")}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const result = data?.result || [];
        const labels = result.map((c) => c.name);
        const dataCounts = result.map((c) => c.count);

        inventoryCanvas.width = Math.max(700, labels.length * 130);
        inventoryCanvas.height = 270;

        const colors = labels.map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`);

        if (inventoryChartInstanceRef.current) {
          inventoryChartInstanceRef.current.destroy();
        }

        const ctx = inventoryCanvas.getContext("2d");
        inventoryChartInstanceRef.current = new window.Chart(ctx, {
          type: "bar",
          data: {
            labels,
            datasets: [{
              label: "Số lượng tồn kho",
              data: dataCounts,
              backgroundColor: colors,
              borderColor: colors.map((c) => c.replace("0.6", "1")),
              borderWidth: 1,
            }],
          },
          options: {
            responsive: true,
            plugins: { legend: { position: "bottom" } },
            scales: {
              x: { title: { display: true, text: "Thể loại" }, ticks: { autoSkip: false } },
              y: { title: { display: true, text: "Số lượng" }, beginAtZero: true },
            },
            maintainAspectRatio: false,
          },
        });
      })
      .catch(() => {});
  }, [chartLoaded, inventoryCategory, canViewStatistics]);

  const handleExportTopProducts = () => {
    const formattedData = dashboard.topProduct.map((item, idx) => ({
      STT: idx + 1,
      "Tên sản phẩm": item.name,
      "Số lượng đã bán": item.sold,
      "Doanh thu (VND)": item.profit,
    }));
    exportToExcel(formattedData, "Top_San_Pham_Ban_Chay", "Top Sản Phẩm");
  };
  const handleExportOrders = () => {
    const formattedData = dashboard.orderNew.map((item) => ({
      "Mã đơn hàng": item.orderCode,
      "Khách hàng": item.fullName,
      "Số điện thoại": item.phone,
      "Địa chỉ/Ghi chú": item.note,
      "Chi tiết sản phẩm mua": item.cart.map(c => `${c.name} (SL: ${c.quantity})`).join(", "),
      "Tổng thanh toán (VND)": item.priceTotal,
      "Phương thức": item.nameMethod,
      "Trạng thái thanh toán": item.nameStatusPay,
      "Trạng thái đơn": getStatusBadge(item.status).label,
      "Thời gian đặt": `${item.formatTime} ${item.formatDay}`,
    }));
    exportToExcel(formattedData, "Danh_Sach_Don_Hang", "Đơn hàng");
  };

  return (
    <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
      <div className="w-full bg-[white] p-[20px] rounded-[20px] mb-[20px] md:mx-[30px] mx-[16px] flex flex-wrap items-center justify-between gap-[15px] shadow-sm">
        <div className="flex flex-col">
          <span className="text-[18px] font-[700] text-gray-800">Bộ lọc báo cáo tổng quan</span>
          <span className="text-[12px] text-gray-400">Chọn thời gian để xem thống kê dữ liệu</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-[10px]">
          <select 
            value={dateFilterType} 
            onChange={(e) => setDateFilterType(e.target.value)}
            className="bg-[#F3F4F6] px-[14px] py-[8px] rounded-[10px] text-[14px] font-[600] border-none outline-none cursor-pointer"
          >
            <option value="range">Khoảng ngày</option>
            <option value="week">Tuần này</option>
            <option value="month">Xem theo Tháng</option>
            <option value="year">Xem theo Năm</option>
          </select>

          {dateFilterType === "range" && (
            <div className="flex items-center gap-[5px]">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#F3F4F6] px-[12px] py-[8px] rounded-[10px] text-[14px] border-none"
              />
              <span className="text-gray-400 text-[14px]">đến</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#F3F4F6] px-[12px] py-[8px] rounded-[10px] text-[14px] border-none"
              />
            </div>
          )}

          {dateFilterType === "month" && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-[#F3F4F6] px-[12px] py-[8px] rounded-[10px] text-[14px] border-none"
            />
          )}

          {dateFilterType === "year" && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-[#F3F4F6] px-[12px] py-[8px] rounded-[10px] text-[14px] border-none"
            >
              {[0, 1, 2, 3].map((offset) => {
                const year = new Date().getFullYear() - offset;
                return <option key={year} value={year}>Năm {year}</option>;
              })}
            </select>
          )}
        </div>
      </div>
      <div className="w-full grid xl:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-y-[20px] xl:gap-x-[40px] gap-x-[20px] md:px-[30px] px-[16px]">
        <div className="bg-[white] flex items-center gap-[20px] justify-center py-[20px] rounded-[20px]">
          <img src="/image/user.png" className="w-[70px]" alt="" />
          <div className="flex flex-col">
            <span className="text-[14px] font-[500]">Khách hàng</span>
            <span className="md:text-[26px] text-[20px] text-[var(--pri)] font-[700]">{dashboard.totalClient ?? 0}</span>
          </div>
        </div>
        <div className="bg-[white] flex items-center gap-[20px] justify-center py-[20px] rounded-[20px]">
          <img src="/image/order.png" className="w-[70px]" alt="" />
          <div className="flex flex-col">
            <span className="text-[14px] font-[500]">Đơn hàng (kỳ này)</span>
            <span className="md:text-[26px] text-[20px] text-[var(--pri)] font-[700]">{dashboard.dashboard?.order ?? 0}</span>
          </div>
        </div>
        <div className="bg-[white] flex items-center gap-[20px] justify-center py-[20px] rounded-[20px]">
          <img src="/image/revenue.png" className="w-[70px]" alt="" />
          <div className="flex flex-col">
            <span className="text-[14px] font-[500]">Doanh thu (kỳ này)</span>
            <span className="md:text-[26px] text-[20px] text-[var(--pri)] font-[700]">{formatPrice(dashboard.dashboard?.priceTotal ?? 0)}</span>
          </div>
        </div>
        <div className="bg-[white] flex items-center gap-[20px] justify-center py-[20px] rounded-[20px]">
          <img src="/image/revenue.png" className="w-[70px]" alt="" />
          <div className="flex flex-col">
            <span className="text-[14px] font-[500]">Tổng kho sản phẩm</span>
            <span className="md:text-[26px] text-[20px] text-[var(--pri)] font-[700]">{dashboard.totalProduct ?? 0}</span>
          </div>
        </div>
      </div>

      {canViewStatistics ? (
        <>
          <div className="md:px-[30px] px-[16px] mt-[20px] py-[20px]">
            <div className="flex flex-col px-[30px] bg-[white] py-[30px] rounded-[20px]">
              <div className="flex justify-between items-center mb-[20px] flex-wrap gap-[10px]">
                <div className="text-[23px] font-[700]">Biểu đồ phân tích doanh thu</div>
                <button 
                  onClick={handleExportRevenue}
                  className="bg-[#10B981] text-white font-[600] text-[14px] px-[15px] py-[8px] rounded-[10px] hover:bg-[#0dd492] transition-all shadow-sm"
                >
                  Xuất Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <canvas id="revenue-chart" style={{ height: "270px" }} />
              </div>
            </div>
          </div>

          {/* Thống kê tồn kho */}
          <div className="md:px-[30px] px-[16px] mt-[20px] py-[20px]">
            <div className="flex flex-col px-[30px] bg-[white] py-[30px] rounded-[20px]">
              <div className="text-[23px] font-[700] mb-[15px]">Thống kê tồn kho</div>
              <div className="flex flex-wrap gap-[10px] mb-[15px]">
                {(dashboard.categoryList || []).map((item) => (
                  <span
                    key={item.id}
                    className={`cursor-pointer text-[14px] font-[600] px-[10px] py-[6px] rounded-[999px] ${inventoryCategory === item.id ? "bg-pri text-white" : "bg-[#F3F4F6]"}`}
                    onClick={() => {
                      const url = new URL(window.location.href);
                      if (item.id) url.searchParams.set("category", item.id);
                      window.history.replaceState({}, "", url);
                      setInventoryCategory(item.id);
                    }}
                  >
                    {item.name}
                  </span>
                ))}
              </div>
              <div className="overflow-x-auto">
                <canvas id="inventoryChart" style={{ height: "300px", width: "auto" }} />
              </div>
            </div>
          </div>

          {/* Top sản phẩm */}
          <div className="md:px-[30px] px-[16px] mt-[20px] py-[20px]">
            <div className="flex flex-col px-[30px] bg-[white] py-[30px] rounded-[20px]">
              <div className="flex justify-between items-center mb-[15px] flex-wrap gap-[10px]">
                <div className="text-[23px] font-[700]">Top sản phẩm bán chạy (Kỳ báo cáo)</div>
                <button 
                  onClick={handleExportTopProducts}
                  className="bg-[#10B981] text-white font-[600] text-[14px] px-[15px] py-[8px] rounded-[10px] hover:bg-[#0dd492] transition-all shadow-sm"
                >
                  Xuất Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#e5e1e1]">
                    <tr>
                      <td className="p-[15px] text-[14px] font-[600] w-[60px] rounded-l-[10px]">STT</td>
                      <td className="p-[15px] text-[14px] font-[600] w-[170px]">Tên sản phẩm</td>
                      <td className="p-[15px] text-[14px] font-[600] w-[100px]">Đã bán</td>
                      <td className="p-[15px] text-[14px] font-[600] w-[170px] rounded-r-[10px]">Doanh thu tương đương</td>
                    </tr>
                  </thead>
                  <tbody>
                    {(dashboard.topProduct || []).length ? (
                      dashboard.topProduct.map((item, index) => (
                        <tr key={index} className="border-b border-gray-300">
                          <td className="p-[15px] text-[14px] font-[700] text-[var(--pri)]">{index + 1}</td>
                          <td className="p-[15px] text-[14px]">{item.name}</td>
                          <td className="p-[15px] text-[14px]">{item.sold}</td>
                          <td className="p-[15px] text-[14px]">{formatPrice(item.profit)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-[15px] text-[14px] text-center text-gray-400">Không tìm thấy dữ liệu trong kỳ này</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <div className="md:px-[30px] px-[16px] mt-[20px] py-[20px]">
        <div className="flex flex-col px-[30px] bg-[white] py-[30px] rounded-[20px]">
          
          <div className="mb-[20px] flex flex-wrap justify-between items-center gap-[15px]">
            <div className="text-[23px] font-[700]">Đơn hàng phát sinh trong kỳ</div>
            
            <div className="flex items-center gap-[10px] flex-wrap">
              <input
                type="text"
                placeholder="🔍 Lọc sản phẩm trong đơn..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="bg-[#F3F4F6] border border-gray-300 rounded-[10px] px-[15px] py-[8px] text-[14px] outline-none w-[240px] focus:border-blue-500 transition-all"
              />

              <button 
                onClick={handleExportOrders}
                className="bg-[#10B981] text-white font-[600] text-[14px] px-[15px] py-[8px] rounded-[10px] hover:bg-[#0dd492] transition-all shadow-sm"
              >
                Xuất Excel
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#e5e1e1]">
                <tr>
                  <td className="p-[15px] text-[14px] font-[600] rounded-l-[10px]">Mã</td>
                  <td className="p-[15px] text-[14px] font-[600] py-[10px]">Thông tin khách</td>
                  <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[400px]">Danh sách sản phẩm</td>
                  <td className="p-[15px] text-[14px] font-[600] py-[10px]">Thanh toán</td>
                  <td className="p-[15px] text-[14px] font-[600] py-[10px]">Trạng thái</td>
                  <td className="p-[15px] text-[14px] font-[600] rounded-r-[10px] py-[10px]">Ngày đặt</td>
                </tr>
              </thead>
              <tbody>
                {(dashboard.orderNew || []).length ? (
                  dashboard.orderNew.map((item, index) => {
                    const badge = getStatusBadge(item.status);
                    return (
                      <tr key={index} className="border-b border-gray-300">
                        <td className="font-[700] text-[var(--pri)] p-[15px] text-[14px] w-[100px]">{item.orderCode}</td>
                        <td className="p-[15px] text-[14px]">
                          <div className="w-[150px]">{item.fullName}</div>
                          <div>SĐT: {item.phone}</div>
                          <div>Địa chỉ: {item.note}</div>
                        </td>
                        <td className="p-[15px] flex flex-col gap-y-[10px] w-[300px]">
                          {(item.cart || []).map((it, i2) => (
                            <div key={i2} className="flex items-center gap-[10px]">
                              <img className="rounded-[10px] w-[120px] h-[80px] object-cover bg-gray-100" src={it.avatar || ""} alt="" />
                              <div className="flex flex-col">
                                <div className="text-[14px]">{it.name}</div>
                                <div className="text-[12px]">Số lượng: {it.quantity} x {formatPrice(it.priceLast)}</div>
                              </div>
                            </div>
                          ))}
                        </td>
                        <td className="p-[15px] text-[14px] w-[220px]">
                          <div>Tổng tiền: {formatPrice(item.priceTotal)}</div>
                          <div>PTTT: {item.nameMethod}</div>
                          <div>TTTT: {item.nameStatusPay}</div>
                        </td>
                        <td className="p-[15px] w-[170px] pr-[25px]">
                          <div className={`w-[120px] ${badge.cls} text-[14px] font-[700] text-center py-[10px] rounded-[10px]`}>{badge.label}</div>
                        </td>
                        <td className="p-[15px]">
                          <div className="text-[14px]">{item.formatTime}</div>
                          <div className="text-[14px]">{item.formatDay}</div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-[15px] text-center text-[14px]">
                      {loading ? "Đang tải dữ liệu kỳ báo cáo..." : "Không có đơn hàng nào khớp điều kiện chọn"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}