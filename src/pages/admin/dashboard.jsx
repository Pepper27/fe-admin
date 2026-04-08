import { useEffect, useRef, useState } from "react";
import { pathAdmin } from "../../config/api";
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

  const [chartLoaded, setChartLoaded] = useState(false);

  const [revenueMonth, setRevenueMonth] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  const [inventoryCategory, setInventoryCategory] = useState(() => {
    const url = new URL(window.location.href);
    return url.searchParams.get("category") || "";
  });

  const revenueChartInstanceRef = useRef(null);
  const inventoryChartInstanceRef = useRef(null);
  const formatPrice = (value) =>
    Number(value || 0).toLocaleString("vi-VN") + "đ";
  const getStatusBadge = (status) => {
    if (status === "initial")
      return { label: "Khởi tạo", cls: "bg-[#FFEEDD] text-[#FFA956]" };
    if (status === "ship")
      return { label: "Đang giao", cls: "bg-[#DDEBFF] text-[#3B82F6]" };
    if (status === "done")
      return { label: "Đã giao", cls: "bg-[#DDFFEE] text-[#10B981]" };
    return { label: "Đã hủy", cls: "bg-[#FEE2E2] text-[#EF4444]" };
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);
    fetch(`${pathAdmin}/admin/dashboard`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const payload = data?.data || {};
        setDashboard({
          ...payload,
          topProduct: payload?.topProduct || [],
        });
        console.log(dashboard);
      })
      .catch(() => setDashboard({}))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!inventoryCategory && (dashboard?.categoryList || []).length) {
      setInventoryCategory(dashboard.categoryList[0].id);
    }
  }, [dashboard?.categoryList, inventoryCategory]);

  // Biểu đồ doanh thu
  useEffect(() => {
    if (!chartLoaded) return;
    const revenueCanvas = document.getElementById("revenue-chart");
    if (!revenueCanvas) return;

    const token = localStorage.getItem("token");
    const [yearStr, monthStr] = String(revenueMonth).split("-");
    const currentYear = Number(yearStr);
    const currentMonth = Number(monthStr); 
    if (!currentYear || !currentMonth) return;

    const previousDate = new Date(currentYear, currentMonth - 2, 1);
    const previousYear = previousDate.getFullYear();
    const previousMonth = previousDate.getMonth() + 1;

    const daysInCurrent = new Date(currentYear, currentMonth, 0).getDate();
    const daysInPrevious = new Date(previousYear, previousMonth, 0).getDate();
    const days = Math.max(daysInCurrent, daysInPrevious);

    const arrayDay = [];
    for (let i = 1; i <= days; i++) arrayDay.push(i);

    fetch(`${pathAdmin}/admin/dashboard/revenueChart`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        currentMonth,
        currentYear,
        previousMonth,
        previousYear,
        arrayDay,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const dataMonthCurrent = data?.dataMonthCurrent || [];
        const dataMonthPrevious = data?.dataMonthPrevious || [];

        if (revenueChartInstanceRef.current) {
          revenueChartInstanceRef.current.destroy();
        }

        const labels = arrayDay;
        const ctx = revenueCanvas.getContext("2d");
        revenueChartInstanceRef.current = new window.Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: `Tháng ${currentMonth}/${currentYear}`,
                data: dataMonthCurrent,
                borderColor: "#4379EE",
                borderWidth: 1.5,
              },
              {
                label: `Tháng ${previousMonth}/${previousYear}`,
                data: dataMonthPrevious,
                borderColor: "#EF3826",
                borderWidth: 1.5,
              },
            ],
          },
          options: {
            plugins: {
              legend: { position: "bottom" },
            },
            scales: {
              x: {
                title: { display: true, text: "Ngày" },
                ticks: { maxRotation: 0, minRotation: 0 },
              },
              y: {
                title: { display: true, text: "Doanh thu (VND)" },
              },
            },
            maintainAspectRatio: false,
          },
        });
      })
      .catch(() => {});
  }, [chartLoaded, revenueMonth]);

    // Biểu đồ tồn kho
    useEffect(() => {
        if (!chartLoaded) return;
        const inventoryCanvas = document.getElementById("inventoryChart");
        if (!inventoryCanvas) return;

        const token = localStorage.getItem("token");

        fetch(
        `${pathAdmin}/admin/dashboard/inventory?category=${encodeURIComponent(inventoryCategory || "")}`,
        {
            method: "GET",
            headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
            },
        }
        )
        .then((res) => res.json())
        .then((data) => {
            const result = data?.result || [];
            const labels = result.map((c) => c.name);
            const dataCounts = result.map((c) => c.count);
            const baseWidth = 700;
            const perBarWidth = 130;
            inventoryCanvas.width = Math.max(baseWidth, labels.length * perBarWidth);
            inventoryCanvas.height = 270;

            const colors = labels.map(
            () =>
                `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
                Math.random() * 255
                )}, ${Math.floor(Math.random() * 255)}, 0.6)`
            );

            if (inventoryChartInstanceRef.current) {
            inventoryChartInstanceRef.current.destroy();
            }

            const ctx = inventoryCanvas.getContext("2d");
            inventoryChartInstanceRef.current = new window.Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [
                {
                    label: "Số lượng tồn kho",
                    data: dataCounts,
                    backgroundColor: colors,
                    borderColor: colors.map((c) => c.replace("0.6", "1")),
                    borderWidth: 1,
                },
                ],
            },
            options: {
                responsive: true,
                plugins: { legend: { position: "bottom" } },
                scales: {
                x: {
                    title: { display: true, text: "Thể loại" },
                    ticks: {
                    maxRotation: 0,
                    minRotation: 0,
                    autoSkip: false,
                    },
                },
                y: {
                    title: { display: true, text: "Số lượng tồn kho" },
                    beginAtZero: true,
                },
                },
                maintainAspectRatio: false,
            },
            });
        })
        .catch(() => {});
    }, [chartLoaded, inventoryCategory]);

  return (
    <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
      <div className="w-full grid xl:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-y-[20px] xl:gap-x-[40px] gap-x-[20px] md:px-[30px] px-[16px]">
        <div className="bg-[white] flex items-center gap-[20px] justify-center py-[20px] rounded-[20px]">
          <img src="/image/user.png" className="w-[70px]" alt="" />
          <div className="flex flex-col">
            <span className="text-[14px] font-[500]">Khách hàng</span>
            <span className="md:text-[26px] text-[20px] text-[var(--pri)] font-[700]">
              {dashboard.totalClient ?? 0}
            </span>
          </div>
        </div>
        <div className="bg-[white] flex items-center gap-[20px] justify-center py-[20px] rounded-[20px]">
          <img src="/image/order.png" className="w-[70px]" alt="" />
          <div className="flex flex-col">
            <span className="text-[14px] font-[500]">Đơn hàng</span>
            <span className="md:text-[26px] text-[20px] text-[var(--pri)] font-[700]">
              {dashboard.dashboard?.order ?? 0}
            </span>
          </div>
        </div>
        <div className="bg-[white] flex items-center gap-[20px] justify-center py-[20px] rounded-[20px]">
          <img src="/image/revenue.png" className="w-[70px]" alt="" />
          <div className="flex flex-col">
            <span className="text-[14px] font-[500]">Doanh thu</span>
            <span className="md:text-[26px] text-[20px] text-[var(--pri)] font-[700]">
              {formatPrice(dashboard.dashboard?.priceTotal ?? 0)}
            </span>
          </div>
        </div>
        <div className="bg-[white] flex items-center gap-[20px] justify-center py-[20px] rounded-[20px]">
          <img src="/image/revenue.png" className="w-[70px]" alt="" />
          <div className="flex flex-col">
            <span className="text-[14px] font-[500]">Tổng số sản phẩm</span>
            <span className="md:text-[26px] text-[20px] text-[var(--pri)] font-[700]">
              {dashboard.totalProduct ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Biểu đồ doanh thu */}
      <div className="md:px-[30px] px-[16px] mt-[20px] py-[20px]">
        <div className="flex flex-col px-[30px] bg-[white] py-[30px] rounded-[20px]">
          <div className="flex items-center justify-between mb-[20px]">
            <div className="text-[23px] font-[700]">Biểu đồ doanh thu</div>
            <input
              type="month"
              name=""
              chart="true"
              value={revenueMonth}
              onChange={(e) => setRevenueMonth(e.target.value)}
              className="bg-[#F3F4F6] px-[12px] py-[8px] rounded-[10px] text-[14px]"
            />
          </div>
          <div className="overflow-x-auto">
            <canvas id="revenue-chart" style={{ height: "250px" }} />
          </div>
        </div>
      </div>

      {/* Section 2: Thống kê tồn kho */}
      <div className="md:px-[30px] px-[16px] mt-[20px] py-[20px]">
        <div className="flex flex-col px-[30px] bg-[white] py-[30px] rounded-[20px]">
          <div className="text-[23px] font-[700] mb-[15px]">Thống kê tồn kho</div>

          <div className="flex flex-wrap gap-[10px] mb-[15px]">
            {(dashboard.categoryList || []).map((item) => (
              <span
                key={item.id}
                inventory-id={item.id}
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
            <canvas id="inventoryChart" style={{ height: "300px",width:"auto"}} />
          </div>
        </div>
      </div>

      {/* Section 2:  Top sp */}
      <div className="md:px-[30px] px-[16px] mt-[20px] py-[20px]">
        <div className="flex flex-col px-[30px] bg-[white] py-[30px] rounded-[20px]">
        <div className="text-[23px] font-[700] mb-[15px]">Top sản phẩm bán chạy</div>

        <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-[#e5e1e1]">
                <tr>
                <td className="p-[15px] text-[14px] font-[600] w-[60px] rounded-l-[10px]">STT</td>
                <td className="p-[15px] text-[14px] font-[600] w-[170px]">Tên sản phẩm</td>
                <td className="p-[15px] text-[14px] font-[600] w-[100px]">Đã bán</td>
                <td className="p-[15px] text-[14px] font-[600] w-[170px] rounded-r-[10px]">Doanh thu</td>
                </tr>
            </thead>
            <tbody>
                {(dashboard.topProduct || []).length ? (
                    dashboard.topProduct.map((item, index) => (
                        <tr key={index} className="border-b border-gray-300">
                        <td className="p-[15px] text-[14px] font-[700] text-[var(--pri)]">
                            {index + 1}
                        </td>
                        <td className="p-[15px] text-[14px]">{item.name}</td>
                        <td className="p-[15px] text-[14px] ">{item.sold}</td>
                        <td className="p-[15px] text-[14px]">{formatPrice(item.profit)}</td>
                        </tr>
                    ))
                ) : (
                <tr>
                    <td colSpan={4} className="p-[15px] text-[14px] ">
                    Chưa có dữ liệu
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
        </div>

      </div>

      {/* Section 3: Đơn hàng mới */}
      <div className="md:px-[30px] px-[16px] mt-[20px] py-[20px]">
        <div className="flex flex-col px-[30px] bg-[white] py-[30px] rounded-[20px]">
          <div className="mb-[20px] text-[23px] font-[700]">Đơn hàng mới</div>
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
                        <td className="font-[700] text-[var(--pri)] p-[15px] text-[14px] w-[100px]">
                          {item.orderCode}
                        </td>
                        <td className="p-[15px] text-[14px]">
                          <div className="w-[150px]">{item.fullName}</div>
                          <div>SĐT: {item.phone}</div>
                          <div>Địa chỉ: {item.note}</div>
                        </td>
                        <td className="p-[15px] flex flex-col gap-y-[10px] w-[300px]">
                          {(item.cart).map((it, i2) => (
                            <div key={i2} className="flex items-center gap-[10px]">
                              <img
                                className="rounded-[10px] w-[120px] h-[80px] object-cover bg-gray-100"
                                src={it.avatar || ""}
                                alt=""
                              />
                              <div className="flex flex-col">
                                <div className="text-[14px]">{it.name}</div>
                                <div className="text-[12px]">
                                  Số lượng: {it.quantity} x {formatPrice(it.priceLast)}
                                </div>
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
                          <div
                            className={`w-[120px] ${badge.cls} text-[14px] font-[700] text-center py-[10px] rounded-[10px]`}
                          >
                            {badge.label}
                          </div>
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
                      {loading ? "Đang tải..." : "Chưa có đơn hàng mới"}
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