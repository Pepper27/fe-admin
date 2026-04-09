import { FaFilter } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { useEffect, useState } from "react";
import { pathAdmin } from "../../../../config/api"
import RoleDelete from "./role-delete";
export default function RolesList() {
  const [roles, SetRoles] = useState([])
  const [page, setPage] = useState(1)
  const [totalPage, setTotalPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [key, setKey] = useState("")
  const [start,setStart] = useState("")
  const [end,setEnd] = useState("")
  const fetchRoles = () => {
    const token = localStorage.getItem("token");
    fetch(`${pathAdmin}/admin/roles?page=${page}&keyword=${key}&start=${start}&end=${end}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data?.code === "error") {
          throw new Error(data.message || "Unauthorized");
        }
        SetRoles(data.data)
        setTotalPage(data.totalPage)
        setTotal(data.total)
      })
      .catch((err) => {
        console.error("Fetch roles failed", err);
        alert(err?.message || "Failed to fetch");
        SetRoles([]);
      })
  };
  useEffect(() => {
    fetchRoles();
  }, [page, key,start, end])
  return (
    <>
      <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
        <div className="sm:text-[30px] text-[20px] font-[700] mb-[30px]">Quản lý quyền</div>
        <div className="inline-flex lg:w-[840px] w-full flex-wrap gap-[20px] bg-[white] items-center rounded-[10px] border-[1px] border-gray-300">
          <div className="py-[20px] px-[30px] flex gap-[5px] items-center border-r-[1px] border-r-gray-300">
            <FaFilter className="text-[18px]" />
            <span className="font-[700] text-[14px]">Bộ lọc</span>
          </div>
          <div className="py-[20px] px-[20px] border-r-[1px] border-r-gray-300 flex items-center">
            <input
              type="date"
              className="font-[700] text-[14px] outline-none"
              value={start}
              onChange={(e) => {
                setStart(e.target.value)
              }}
            />
            <span className="mx-[10px]">-</span>
            <input
              type="date"
              className="font-[700] text-[14px] outline-none"
              value={end}
              onChange={(e) => {
                setEnd(e.target.value)
              }}
            />
          </div>
          <div className="w-[150px] py-[20px] pl-[10px] pr-[30px] flex gap-[5px] items-center text-[red] font-[700] text-[14px]"
            onClick={() => {
              setStart("");
              setEnd("");
              setPage(1);
            }}
          >
            <MdDelete className="text-[16px]" />
            <div>Xóa lọc</div>
          </div>
        </div>
        <div className="flex gap-[20px] items-center mt-[20px] flex-wrap">
          <div className="flex gap-[10px] items-center bg-[white] py-[20px] px-[20px] rounded-[10px] border border-gray-300">
            <CiSearch />
            <input className="placeholder:text-[14px] text-[14px] outline-none w-[300px]" placeholder="Tìm kiếm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1)
                  setKey(e.target.value)
                }
              }}
            ></input>
          </div>
          <a href="/admin/role/create" className="text-[white] text-[14px] hover:bg-second bg-pri py-[20px] px-[25px] rounded-[10px] border border-gray-300">+ Tạo mới</a>
        </div>
        <div className="mt-[20px]">
          <div className="flex flex-col px-[30px] bg-[white] py-[30px] rounded-[20px]" >
            <div className="overflow-x-auto">
              <table className="xl:w-full  w-[1100px]">
                <thead className="bg-[#e5e1e1] ">
                  <tr >
                    <td className="rounded-l-[10px] p-[15px] text-[14px] font-[600] py-[10px] w-[200px]">Tên quyền</td>
                    <td className="p-[15px] text-[14px] font-[600] w-auto">Mô tả</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[180px]">Tạo bởi</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[180px]">Cập nhật bởi</td>
                    <td className="p-[15px] text-[14px] font-[600] rounded-r-[10px] py-[10px]">Hành động</td>
                  </tr>
                </thead>
                <tbody>
                  {
                    roles? (
                      roles.map(item => (
                        <tr key={item._id}>
                          <td className="p-[15px] text-[14px] ">
                            <div>{item.name}</div>
                          </td>
                          <td className="p-[15px] text-[14px]">
                            <div className="text-[14px]">{item.description}</div>
                          </td>
                          <td className="p-[15px]  pr-[25px]">
                          <div className="flex flex-col gap-y-[1px]">
                              <div className="text-[14px]">{item.createdByName}</div>
                              <div className="text-[12px]">{item.createdAtFormat}</div>
                            </div>
                          </td>
                          <td className="p-[15px] w-[160px] pr-[25px]">
                            <div className="flex flex-col gap-y-[1px]">
                              <div className="text-[14px]">{item.updatedByName}</div>
                              <div className="text-[12px]">{item.updatedAtFormat}</div>
                            </div>
                          </td>
                          <td className="p-[15px]">
                            <div className="flex">
                              <a href={`/admin/role/update/${item._id}`} className="rounded-l-[10px] text-[14px] p-[15px] bg-[white] border-y border-l border-gray-300">
                                <FaRegEdit className="text-[16px] font-[700]" />
                              </a>
                              <RoleDelete roles={item} onDeleted={fetchRoles} />
                            </div>
                          </td>
                        </tr>
                      ))
                    )
                      : (
                        <tr>
                          <td colSpan="7">
                            <div className="flex items-center justify-center gap-[10px] py-[30px] text-[14px] text-gray-500">
                              <CiSearch className="md:text-[20px] text-[18px]" />
                              <span className="md:text-[16px] text-[14px]">Không tìm thấy quyền</span>
                            </div>
                          </td>
                        </tr>
                      )
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="mt-[30px] flex items-center gap-[10px] text-[14px]">
          {
            roles? (
              <>
                <span>Hiển thị {(page - 1) * 4 + 1} - {Math.min(page * 4, total)} của {total}</span>
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
            )
              :
              <>
              </>
          }
        </div>
      </div>
    </>
  )
}
