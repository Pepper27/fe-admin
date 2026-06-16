import { FaFilter } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { useEffect, useState } from "react";

import Pagination from '../../../components/Pagination'
import { fetchClients as fetchClientsService } from '../../../services/client.service';
import ClientDelete from "./client-delete";
import { ADMIN_LIST_LIMIT, paginateItems, sortByCreatedDesc } from '../../../helpers/adminList';


export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [key, setKey] = useState("");
  const limit = 10;


  const fetchClients = async () => {
    try {
      const data = await fetchClientsService({ page: 1, keyword: key, limit: ADMIN_LIST_LIMIT });
      if (data?.code === "error") throw new Error(data.message || "Unauthorized");
      const allClients = sortByCreatedDesc(data?.data || []);
      setClients(paginateItems(allClients, page, limit));
      setTotal(allClients.length);
      setTotalPage(Math.max(1, Math.ceil(allClients.length / limit)));
    } catch (err) {
      console.error("Fetch clients failed", err);
      alert(err?.message || "Failed to fetch");
      setClients([]);
      setTotalPage(1);
      setTotal(0);
    }

  };

  useEffect(() => {
    fetchClients();
  }, [page, key]);

  const formatDateTime = (date) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleString("vi-VN");
    } catch {
      return String(date);
    }
  };

  const handleDeleted = (deletedId) => {
    setClients((prev) => prev.filter((c) => c._id !== deletedId));
  };

  return (
    <>
      <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
        <div className="sm:text-[30px] text-[20px] font-[700]">Quản lý account khách hàng</div>
        <div className="flex gap-[20px] items-center mt-[20px] flex-wrap">
          <div className="flex gap-[10px] items-center bg-[white] py-[20px] px-[20px] rounded-[10px] border border-gray-300">
            <CiSearch />
            <input
              className="placeholder:text-[14px] text-[14px] outline-none w-[300px]"
              placeholder="Tìm theo tên/email/phone"
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
                    <td className="rounded-l-[10px] p-[15px] text-[14px] font-[600] py-[10px] w-[260px]">Khách hàng</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[260px]">Email</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[180px]">Số điện thoại</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[240px]">Tạo lúc</td>
                    <td className="p-[15px] text-[14px] font-[600] rounded-r-[10px] py-[10px] w-[140px]">Hành động</td>
                  </tr>
                </thead>
                <tbody>
                  {clients.length > 0 ? (
                    clients.map((c) => (
                      <tr key={c._id}>
                        <td className="p-[15px] text-[14px]">
                          <div className="font-[700]">{c.fullName || "(Chưa có tên)"}</div>
                          <div className="text-[12px] text-gray-500">{c._id}</div>
                        </td>
                        <td className="p-[15px] text-[14px] break-all">{c.email || ""}</td>
                        <td className="p-[15px] text-[14px]">{c.phone || ""}</td>
                        <td className="p-[15px] text-[14px]">{formatDateTime(c.createdAt)}</td>
                        <td className="p-[15px]">
                          <div className="flex">
                            {/* placeholder for future: view modal/detail */}
                            <button
                              type="button"
                              className="rounded-l-[10px] text-[14px] p-[15px] bg-[white] border-y border-l border-gray-300 hover:bg-gray-50"
                              onClick={() => window.location.href = `/admin/client/${c._id}`}
                            >
                              Xem
                            </button>
                            <ClientDelete client={c} onDeleted={handleDeleted} />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">
                        <div className="flex items-center justify-center gap-[10px] py-[30px] text-[14px] text-gray-500">
                          <CiSearch className="md:text-[20px] text-[18px]" />
                          <span className="md:text-[16px] text-[14px]">Không tìm thấy khách hàng</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>


        <Pagination page={page} totalPage={totalPage} total={total} limit={limit} onChange={setPage} />

      </div>
    </>
  );
}
