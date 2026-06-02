import { FaFilter } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { useEffect, useState } from "react";
import Pagination from '../../../components/Pagination'
import { pathAdmin } from "../../../config/api"
import CategoryDelete from "./category-delete";


const renderCategoryOptions = (cats, level = 0) => {
  if (!Array.isArray(cats)) return null;
  return cats
    .slice()
    .sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")))
    .map((c) => {
      const id = c?._id || c?.id;
      const name = c?.name || "";
      const children = c?.children;
      return (
        <>
          <option value={String(id)}>
            {"--".repeat(level)} {name}
          </option>
          {Array.isArray(children) && children.length
            ? renderCategoryOptions(children, level + 1)
            : null}
        </>
      );
    });
};

export default function CategoryList() {
  const [category, setCategory] = useState([]); 
  const [treeCategories, setTreeCategories] = useState([]); 
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [key, setKey] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const fetchCategories = () => {
    const token = localStorage.getItem("token");
    const limit = 10;
    const url = `${pathAdmin}/admin/categories?page=${page}&limit=${limit}&keyword=${encodeURIComponent(key)}&categoryId=${categoryFilter}&startDate=${startDate}&endDate=${endDate}`;
    fetch(url, {

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
        setCategory(data.data || []);
        setTotalPage(data.totalPage || 1);
        setTotal(data.total || 0);
      })
      .catch((err) => {
        console.error("Fetch categories failed", err);
        alert(err?.message || "Failed to fetch");
        setCategory([]);
      });
  };

  // 2. Hàm quét thử các API để lấy TOÀN BỘ danh mục dạng cây (để hiển thị select)
  const fetchFirstOk = async (urls) => {
    const token = localStorage.getItem("token");
    for (const url of urls) {
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          credentials: "include",
        });
        if (res.status === 404) continue;
        const data = await res.json();
        if (data?.code === "error") continue;
        return data;
      } catch {
        // thử link tiếp theo
      }
    }
    return null;
  };

  // Gọi API lấy dữ liệu cây 1 lần duy nhất khi component mount
  useEffect(() => {
    const loadTreeData = async () => {
      const categoriesRes = await fetchFirstOk([
        `${pathAdmin}/admin/categories/parent`,
        `${pathAdmin}/v1/admin/categories/parent`,
        `${pathAdmin}/v1/admin/categories`,
        `${pathAdmin}/admin/categories`,
      ]);
      setTreeCategories(categoriesRes?.data || []);
    };
    loadTreeData();
  }, []);

  // Gọi lại API bảng mỗi khi các params bộ lọc thay đổi
  useEffect(() => {
    fetchCategories();
  }, [page, key, categoryFilter, startDate, endDate]);

  const handleResetFilters = () => {
    setCategoryFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
    // also clear search state and active keyword so search is fully reset
    setSearchInput("");
    setKey("");
  };

  return (
    <>
      <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
        <div className="sm:text-[30px] text-[20px] font-[700] mb-[30px]">Quản lý danh mục</div>

        {/* Thanh Bộ lọc */}
        <div className="inline-flex lg:w-[900px] w-full flex-wrap gap-[20px] bg-[white] items-center rounded-[10px] border-[1px] border-gray-300">
          <div className="py-[20px] px-[30px] flex gap-[5px] items-center border-r-[1px] border-r-gray-300">
            <FaFilter className="text-[18px]" />
            <span className="font-[700] text-[14px]">Bộ lọc</span>
          </div>

          {/* Lọc theo danh mục với thiết kế cây (thụt lề --) */}
          <div className="py-[20px] px-[20px] border-r-[1px] border-r-gray-300">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setPage(1);
                setCategoryFilter(e.target.value);
              }}
              className="font-[700] outline-none text-[12px] w-[150px] bg-transparent cursor-pointer"
            >
              <option value="">Tất cả danh mục</option>
              {/* 3. Gọi hàm đệ quy map cây tại đây */}
              {renderCategoryOptions(treeCategories)}
            </select>
          </div>

          {/* Lọc theo khoảng ngày (createdAt) */}
          <div className="py-[20px] px-[20px] border-r-[1px] border-r-gray-300 flex items-center">
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setPage(1); setStartDate(e.target.value); }}
              className="font-[700] text-[14px] outline-none"
            />
            <span className="mx-[10px]-">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setPage(1); setEndDate(e.target.value); }}
              className="font-[700] text-[14px] outline-none"
            />
          </div>

          {/* Nút Xóa lọc */}
          <div
            onClick={handleResetFilters}
            className="w-[150px] py-[20px] pl-[10px] pr-[30px] flex gap-[5px] items-center text-[red] font-[700] text-[14px] cursor-pointer hover:opacity-80"
          >
            <MdDelete className="text-[16px]" />
            <div>Xóa lọc</div>
          </div>
        </div>

        {/* Thanh Tìm kiếm & Tạo mới */}
        <div className="flex gap-[20px] items-center mt-[20px] flex-wrap">
          <div className="flex gap-[10px] items-center bg-[white] py-[20px] px-[20px] rounded-[10px] border border-gray-300">
            <CiSearch />
            <input
              className="placeholder:text-[14px] text-[14px] outline-none w-[300px]"
              placeholder="Tìm kiếm"
              value={searchInput}
              onChange={(e) => setSearchInput(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  setKey(searchInput);
                }
              }}
            />
          </div>
          <a href="/admin/category/create" className="text-[white] text-[14px] hover:bg-second bg-pri py-[20px] px-[25px] rounded-[10px] border border-gray-300">+ Tạo mới</a>
        </div>

        {/* Danh sách Table */}
        <div className="mt-[20px]">
          <div className="flex flex-col px-[30px] bg-[white] py-[30px] rounded-[20px]" >
            <div className="overflow-x-auto">
              <table className="xl:w-full w-[1100px]">
                <thead className="bg-[#e5e1e1] ">
                  <tr>
                    <td className="rounded-l-[10px] p-[15px] text-[14px] font-[600] py-[10px] w-[200px]">Tên danh mục</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[190px]">Ảnh đại diện</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] ">Vị trí</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[180px]">Tạo bởi</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[180px]">Cập nhật bởi</td>
                    <td className="p-[15px] text-[14px] font-[600] rounded-r-[10px] py-[10px]">Hành động</td>
                  </tr>
                </thead>
                <tbody>
                  {category.length > 0 ? (
                    category.map(item => (
                      <tr key={item._id}>
                        <td className="p-[15px] text-[14px] "><div>{item.name}</div></td>
                        <td className="p-[15px] "><img className="rounded-[10px] w-[120px]" src={item.avatar} alt={item.name}></img></td>
                        <td className="p-[15px] text-[14px] "> <div className="text-[14px] ml-[10px]">{item.position}</div></td>
                        <td className="p-[15px] pr-[25px]">
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
                            <a href={`/admin/category/update/${item._id}`} className="rounded-l-[10px] text-[14px] p-[15px] bg-[white] border-y border-l border-gray-300">
                              <FaRegEdit className="text-[16px] font-[700]" />
                            </a>
                            <CategoryDelete category={item} onDeleted={fetchCategories} />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">
                        <div className="flex items-center justify-center gap-[10px] py-[30px] text-[14px] text-gray-500">
                          <CiSearch className="md:text-[20px] text-[18px]" />
                          <span className="md:text-[16px] text-[14px]">Không tìm thấy danh mục</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <Pagination page={page} totalPage={totalPage} total={total} limit={10} onChange={setPage} />
      </div>
    </>
  );
}
