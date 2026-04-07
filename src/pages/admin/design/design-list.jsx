import { FaFilter } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { useEffect, useState } from "react";
import { pathAdmin } from "../../../config/api";
import DesignDelete from "./design-delete";
import DesignModal from "./design-modal";

export default function DesignList() {
  const [designs, setDesigns] = useState([]);
  const [openId, setOpenId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [key, setKey] = useState("");
  const limit = 10;

  const fetchDesigns = () => {
    const token = localStorage.getItem("token");
    fetch(`${pathAdmin}/admin/designs?page=${page}&limit=${limit}&keyword=${encodeURIComponent(key)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.code === "error") throw new Error(data.message || "Unauthorized");
        setDesigns(data?.data || []);
        setTotalPage(data?.totalPage || 1);
        setTotal(data?.total || 0);
      })
      .catch((err) => {
        console.error("Fetch designs failed", err);
        alert(err?.message || "Failed to fetch");
        setDesigns([]);
        setTotalPage(1);
        setTotal(0);
      });
  };

  useEffect(() => {
    fetchDesigns();
  }, [page, key]);

  const formatDateTime = (date) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleString("vi-VN");
    } catch {
      return String(date);
    }
  };

  const formatPrice = (price) => {
    return (Number(price) || 0).toLocaleString("vi-VN") + "₫";
  };

  const handleDeleted = (deletedId) => {
    setDesigns((prev) => prev.filter((d) => d._id !== deletedId));
  };

  return (
    <>
      {openId ? (
        <DesignModal
          id={openId}
          onClose={() => setOpenId("")}
        />
      ) : null}
      <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
        <div className="sm:text-[30px] text-[20px] font-[700] mb-[30px]">Quản lý My Designs</div>

        <div className="inline-flex lg:w-[840px] w-full flex-wrap gap-[20px] bg-[white] items-center rounded-[10px] border-[1px] border-gray-300">
          <div className="py-[20px] px-[30px] flex gap-[5px] items-center border-r-[1px] border-r-gray-300">
            <FaFilter className="text-[18px]" />
            <span className="font-[700] text-[14px]">Bộ lọc</span>
          </div>
          <div className="w-[150px] py-[20px] pl-[10px] pr-[30px] flex gap-[5px] items-center text-[red] font-[700] text-[14px]">
            <MdDelete className="text-[16px]" />
            <button
              type="button"
              onClick={() => {
                setPage(1);
                setKey("");
              }}
              className="text-left"
            >
              Xóa lọc
            </button>
          </div>
        </div>

        <div className="flex gap-[20px] items-center mt-[20px] flex-wrap">
          <div className="flex gap-[10px] items-center bg-[white] py-[20px] px-[20px] rounded-[10px] border border-gray-300">
            <CiSearch />
            <input
              className="placeholder:text-[14px] text-[14px] outline-none w-[300px]"
              placeholder="Tìm theo tên hoặc guestId"
              defaultValue={key}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  setKey(e.target.value);
                }
              }}
            />
          </div>
        </div>

        <div className="mt-[20px]">
          <div className="flex flex-col px-[30px] bg-[white] py-[30px] rounded-[20px]">
            <div className="overflow-x-auto">
              <table className="xl:w-full w-[1100px]">
                <thead className="bg-[#e5e1e1] ">
                  <tr>
                    <td className="p-[15px] text-[14px] font-[600] rounded-l-[10px] w-[70px]">
                      <input type="checkbox" className="w-[20px] h-[20px]" />
                    </td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[220px]">Tên</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[260px]">GuestId</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[220px]">Khách</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[120px]">Slots</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[180px]">Tổng tiền</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[220px]">Tạo lúc</td>
                    <td className="p-[15px] text-[14px] font-[600] rounded-r-[10px] py-[10px] w-[140px]">Hành động</td>
                  </tr>
                </thead>
                <tbody>
                  {designs.length > 0 ? (
                    designs.map((d) => (
                      <tr key={d._id}>
                        <td className="p-[15px] text-[14px] w-[40px]">
                          <input type="checkbox" className="w-[20px] h-[20px]" />
                        </td>
                        <td className="p-[15px] text-[14px]">
                          <div className="font-[600]">{d.name || "(Không tên)"}</div>
                          <div className="text-[12px] text-gray-500">{d._id}</div>
                        </td>
                        <td className="p-[15px] text-[14px] break-all">{d.guestId}</td>
                        <td className="p-[15px] text-[14px]">
                          <div className="font-[700]">{d?.user?.fullName || "(guest)"}</div>
                          <div className="text-[12px] text-gray-500">{d?.user?.email || ""}</div>
                        </td>
                        <td className="p-[15px] text-[14px]">{d?.rulesSnapshot?.slotCount ?? ""}</td>
                        <td className="p-[15px] text-[14px]">{formatPrice(d?.priceSnapshot?.total)}</td>
                        <td className="p-[15px] text-[14px]">{formatDateTime(d?.createdAt)}</td>
                        <td className="p-[15px]">
                          <div className="flex">
                            {/* Placeholder for future detail page */}
                            <button
                              type="button"
                              onClick={() => setOpenId(d._id)}
                              className="rounded-l-[10px] text-[14px] p-[15px] bg-[white] border-y border-l border-gray-300 hover:bg-gray-50"
                            >
                              Xem
                            </button>
                            <DesignDelete design={d} onDeleted={handleDeleted} />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8">
                        <div className="flex items-center justify-center gap-[10px] py-[30px] text-[14px] text-gray-500">
                          <CiSearch className="md:text-[20px] text-[18px]" />
                          <span className="md:text-[16px] text-[14px]">Không tìm thấy designs</span>
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
    </>
  );
}
