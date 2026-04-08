import { FaFilter } from "react-icons/fa6";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { pathAdmin } from "../../../config/api";
import ProductDelete from "./product-delete";

export default function ProductList() {
  const MATERIAL_OPTIONS = ["Vàng", "Vàng hồng", "Bạc"];

  const normalizeText = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const [products, setProducts] = useState([]);
  const [creators, setCreators] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [stockFilter, setStockFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");
  const [creatorFilter, setCreatorFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const formatPrice = (price) => {
    return Number(price).toLocaleString("vi-VN") + "₫";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const handleDeletedSuccess = (deletedId) => {
    setProducts((prev) => prev.filter((item) => item._id !== deletedId));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${pathAdmin}/admin/account`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setCreators(data?.data || []);
      })
      .catch(() => setCreators([]));

    // Fetch categories
    fetch(`${pathAdmin}/admin/categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setCategories(data?.data || []);
      })
      .catch(() => setCategories([]));
  }, []);

  const getDisplayPrice = (product) => {
    const prices = (product?.variants || [])
      .map((v) => Number(v?.price))
      .filter((p) => Number.isFinite(p));

    if (!prices.length) return "0₫";

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    if (min === max) return formatPrice(min);

    return `${formatPrice(min)} - ${formatPrice(max)}`;
  };

  const handleResetFilters = () => {
    setStockFilter("");
    setCategoryFilter("");
    setMaterialFilter("");
    setCreatorFilter("");
    setStartDate("");
    setEndDate("");
    setMinPrice("");
    setMaxPrice("");
    setKeyword("");
    setPage(1);
  };

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem("token");

    setLoading(true);
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);
    if (creatorFilter) params.append("createdBy", creatorFilter);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    if (stockFilter) params.append("stockStatus", stockFilter);
    if (categoryFilter) params.append("categoryId", categoryFilter);
    if (materialFilter) params.append("material", materialFilter);
    params.append("page", String(page));
    params.append("limit", String(limit));

    fetch(`${pathAdmin}/admin/products?${params.toString()}`, {
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
        setProducts(data?.data || []);
        setTotal(data?.total || 0);
        setTotalPage(data?.totalPage || 1);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        console.error("Fetch products failed", err);
        alert(err?.message || "Failed to fetch");
        setProducts([]);
        setTotal(0);
        setTotalPage(1);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [keyword, creatorFilter, startDate, endDate, minPrice, maxPrice, stockFilter, categoryFilter, materialFilter, page, limit]);

  return (
    <>
      <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
        <div className="sm:text-[30px] text-[20px] font-[700] mb-[30px]">Quản lý sản phẩm</div>

        <div className="flex w-full overflow-x-auto bg-[white] rounded-[10px] border-[1px] border-gray-300">
          <div className="flex items-center gap-0 min-w-max">
            <div className="py-[15px] px-[20px] flex gap-[5px] items-center border-r-[1px] border-r-gray-300">
              <FaFilter className="text-[16px]" />
              <span className="font-[700] text-[13px] whitespace-nowrap">Bộ lọc</span>
            </div>
            <div className="py-[15px] px-[15px] border-r-[1px] border-r-gray-300">
              <select
                value={creatorFilter}
                onChange={(e) => {
                  setPage(1);
                  setCreatorFilter(e.target.value);
                }}
                className="font-[700] text-black outline-none text-[12px] w-[140px]"
              >
                <option value="">Người tạo</option>
                {creators.map((creator) => (
                  <option key={creator._id} value={creator._id}>
                    {creator.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="py-[15px] px-[15px] border-r-[1px] border-r-gray-300">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setPage(1);
                  setCategoryFilter(e.target.value);
                }}
                className="font-[700] outline-none text-[12px] w-[120px]"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="py-[15px] px-[15px] border-r-[1px] border-r-gray-300">
              <select
                value={stockFilter}
                onChange={(e) => {
                  setPage(1);
                  setStockFilter(e.target.value);
                }}
                className="font-[700] outline-none text-[12px] w-[110px]"
              >
                <option value="">Tất cả kho</option>
                <option value="in_stock">In stock</option>
                <option value="low_stock">Low stock</option>
                <option value="out_of_stock">Out of stock</option>
              </select>
            </div>
            <div className="py-[15px] px-[15px] border-r-[1px] border-r-gray-300">
              <select
                value={materialFilter}
                onChange={(e) => {
                  setPage(1);
                  setMaterialFilter(e.target.value);
                }}
                className="font-[700] outline-none text-[12px] w-[110px]"
              >
                <option value="">Tất cả chất liệu</option>
                {MATERIAL_OPTIONS.map((material) => (
                  <option key={material} value={material}>
                    {material}
                  </option>
                ))}
              </select>
            </div>
            <div className="py-[15px] px-[15px] border-r-[1px] border-r-gray-300 flex items-center gap-[5px]">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => {
                  setPage(1);
                  setMinPrice(e.target.value);
                }}
                placeholder="Min"
                className="font-[700] outline-none text-[12px] w-[70px] px-[5px] py-[4px] border border-gray-200 rounded"
              />
              <span className="text-gray-400 text-[12px]">-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => {
                  setPage(1);
                  setMaxPrice(e.target.value);
                }}
                placeholder="Max"
                className="font-[700] outline-none text-[12px] w-[70px] px-[5px] py-[4px] border border-gray-200 rounded"
              />
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
              onClick={handleResetFilters}
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
              placeholder="Tìm kiếm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  setKeyword(e.target.value);
                }
              }}
            />
          </div>

          <Link
            to="/admin/product/create"
            className="text-[white] text-[14px] hover:bg-second bg-pri py-[20px] px-[25px] rounded-[10px] border border-gray-300"
          >
            + Tạo mới
          </Link>
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
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[90px]">Ảnh</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[360px]">Tên sản phẩm</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[160px]">Tên danh mục</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[200px]">Giá</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[100px]">Tồn kho</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[100px]">Ngày tạo</td>
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
                  ) : products.length ? (
                    products.map((item) => (
                      <tr key={item._id}>
                        <td className="p-[15px] text-[14px] w-[40px]">
                          <input
                            type="checkbox"
                            value={item._id}
                            className="w-[20px] h-[20px]"
                          />
                        </td>
                        <td className="p-[15px] text-[14px]">
                          <img
                            src={item.variants?.[0]?.images?.[0]}
                            alt={item.name}
                            className="w-[60px] h-[60px] object-cover rounded"
                          />
                        </td>
                        <td className="p-[15px] text-[14px]">{item.name}</td>
                        <td className="p-[15px] text-[14px]">{item.category.name}</td>
                        <td className="p-[15px] text-[14px]">{getDisplayPrice(item)}</td>
                        <td className="p-[15px] text-[14px]">
                          <span
                            className={`px-2 py-1 rounded text-xs font-[600] ${item?.stockStatus === "out_of_stock"
                              ? "bg-red-100 text-red-800"
                              : item?.stockStatus === "low_stock"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                              }`}
                          >
                            {(() => {
                              const total = (item?.variants || []).reduce((sum, v) => sum + (v?.quantity || 0), 0);
                              return total;
                            })()}
                          </span>
                        </td>
                        <td className="p-[15px] text-[14px]">{formatDate(item.createdAt)}</td>

                        <td className="p-[15px]">
                          <div className="flex">
                            <Link
                              to={`/admin/product/update/${item._id}`}
                              className="rounded-l-[10px] text-[14px] p-[15px] bg-[white] border-y border-l border-gray-300"
                            >
                              <FaRegEdit className="text-[16px] font-[700]" />
                            </Link>
                            <ProductDelete product={item} onDeleted={handleDeletedSuccess} />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8">
                        <div className="flex items-center justify-center gap-[10px] py-[30px] text-[14px] text-gray-500">
                          <CiSearch className="md:text-[20px] text-[18px]" />
                          <span className="md:text-[16px] text-[14px]">Không tìm thấy sản phẩm</span>
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
              <span>Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, total)} của {total}</span>
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
