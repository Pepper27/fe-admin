import { FaFilter } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FilterBar from '../../../components/FilterBar'
import useFilter from '../../../hooks/useFilter'
import Pagination from '../../../components/Pagination'
import { fetchCategoryList, fetchCategoryTree } from '../../../services/category.service'
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
  const location = useLocation();
  const navigate = useNavigate();

  const getCategoryId = (item) => String(item?._id || item?.id || "");

  const parseCreatedAtFormat = (value) => {
    const text = String(value || "").trim();
    if (!text) return NaN;

    const match = text.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
    );
    if (!match) return NaN;

    const [, day, month, year, hour = "0", minute = "0", second = "0"] = match;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    ).getTime();
  };

  const getCreatedTime = (item) => {
    const createdAt = item?.createdAt ? new Date(item.createdAt).getTime() : NaN;
    if (Number.isFinite(createdAt) && createdAt > 0) return createdAt;

    const createdAtFormat = parseCreatedAtFormat(item?.createdAtFormat);
    if (Number.isFinite(createdAtFormat) && createdAtFormat > 0) return createdAtFormat;

    const objectId = String(item?._id || item?.id || "");
    if (/^[a-f\d]{24}$/i.test(objectId)) {
      return parseInt(objectId.slice(0, 8), 16) * 1000;
    }

    return 0;
  };

  const sortByNewest = (items) => {
    if (!Array.isArray(items)) return [];
    return items.slice().sort((a, b) => {
      return getCreatedTime(b) - getCreatedTime(a);
    });
  };
  // use centralized filter hook for maintainability
  const { values: filterValues, handleChange: onFilterChange, reset: resetFilters } = useFilter({
    defaultValues: { categoryFilter: '', dateRange: { start: '', end: '' } },
    onApply: (payload) => {
      // when filters apply, ensure page resets to 1
      setPage(1);
      // payload will be used by useEffect dependency to refetch
    },
    debounce: 200,
  });

  const categoryFilter = filterValues.categoryFilter;
  const startDate = filterValues.dateRange?.start || '';
  const endDate = filterValues.dateRange?.end || '';
  const fetchCategories = async () => {
    try {
      const data = await fetchCategoryList({
        page: 1,
        keyword: key,
        categoryId: categoryFilter,
        startDate,
        endDate,
        limit: 1000,
      });
      if (data?.code === "error") throw new Error(data.message || "Unauthorized");
      const allCategories = sortByNewest(data.data || []);
      const createdCategory = location.state?.createdCategory;
      const createdCategoryId = getCategoryId(createdCategory);
      const mergedCategories = createdCategoryId
        ? [createdCategory, ...allCategories.filter((item) => getCategoryId(item) !== createdCategoryId)]
        : allCategories;
      const pageSize = 10;
      const startIndex = (page - 1) * pageSize;

      setCategory(mergedCategories.slice(startIndex, startIndex + pageSize));
      setTotal(mergedCategories.length);
      setTotalPage(Math.max(1, Math.ceil(mergedCategories.length / pageSize)));
    } catch (err) {
      console.error("Fetch categories failed", err);
      alert(err?.message || "Failed to fetch");
      setCategory([]);
    }
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
      const categoriesRes = await fetchCategoryTree();
      setTreeCategories(categoriesRes?.data || []);
    };
    loadTreeData();
  }, []);

  // Gọi lại API bảng mỗi khi các params bộ lọc thay đổi
  useEffect(() => {
    fetchCategories();
  }, [page, key, categoryFilter, startDate, endDate]);

  useEffect(() => {
    if (!location.state?.createdCategory) return;

    toast.success("Tạo danh mục thành công!");
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const handleResetFilters = () => {
    resetFilters();
    setPage(1);
    // also clear search state and active keyword so search is fully reset
    setSearchInput("");
    setKey("");
  };

  return (
    <>
      <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
        <div className="sm:text-[30px] text-[20px] font-[700] mb-[30px]">Quản lý danh mục</div>

        {/* Thanh Bộ lọc - migrated to FilterBar for reuse */}
        <FilterBar
          fields={[
            { name: 'categoryFilter', type: 'custom', render: (value, onChange) => (
                <select
                  value={value || ''}
                  onChange={(e) => { onChange(e.target.value); }}
                  className="font-[700] outline-none text-[12px] w-[150px] bg-transparent cursor-pointer"
                >
                  <option value="">Tất cả danh mục</option>
                  {renderCategoryOptions(treeCategories)}
                </select>
              ),
            },
            { name: 'dateRange', type: 'date-range' },
          ]}
          values={filterValues}
          onChange={(v) => {
            // when change, ensure page resets in hook's onApply; however set page here too on immediate change
            setPage(1);
            onFilterChange(v);
          }}
          onReset={handleResetFilters}
        card={true}
        />

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
