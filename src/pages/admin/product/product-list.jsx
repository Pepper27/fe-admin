import { FaFilter } from "react-icons/fa6";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import React, { useEffect, useState } from "react";
import FilterBar from '../../../components/FilterBar'
import useFilter from '../../../hooks/useFilter'
import { getDisplayPrice } from '../../../helpers/price'
import Pagination from '../../../components/Pagination'
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { pathAdmin } from "../../../config/api";
import ProductDelete from "./product-delete";

export default function ProductList() {
  const [materials, setMaterials] = useState([]);

  const normalizeText = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const normalizeForSearch = (value) =>
    normalizeText(value)
      .replace(/\s+/g, " ") // collapse internal whitespace
      .trim();

  const [products, setProducts] = useState([]);
  const [creators, setCreators] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  const { values: filterValues, handleChange: onFilterChange, reset: resetFilterValues } = useFilter({
    defaultValues: {
      creatorFilter: '', categoryFilter: '', collectionFilter: '', stockFilter: '', materialFilter: '', minPrice: '', maxPrice: '', dateRange: { start: '', end: '' }
    },
    onApply: () => setPage(1),
    debounce: 200,
  });

  const creatorFilter = filterValues.creatorFilter;
  const categoryFilter = filterValues.categoryFilter;
  const collectionFilter = filterValues.collectionFilter;
  const stockFilter = filterValues.stockFilter;
  const materialFilter = filterValues.materialFilter;
  const minPrice = filterValues.minPrice;
  const maxPrice = filterValues.maxPrice;
  const startDate = filterValues.dateRange?.start || '';
  const endDate = filterValues.dateRange?.end || '';
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [total, setTotal] = useState(0);
  // admin UI: no facets here (client-facing filters live in frontend2)
  const limit = 10;

  const navigate = useNavigate();

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

    const headers = {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    };

    const fetchFirstOk = async (urls) => {
      for (const url of urls) {
        try {
          const res = await fetch(url, {
            method: "GET",
            headers,
            credentials: "include",
          });
          if (res.status === 404) continue;
          const data = await res.json();
          if (data?.code === "error") continue;
          return data;
        } catch {
          // try next
        }
      }
      return null;
    };

    (async () => {
      // Creators (accounts list)
      const creatorsRes = await fetchFirstOk([
        `${pathAdmin}/v1/admin/account`,
        `${pathAdmin}/admin/account`,
        `${pathAdmin}/v1/admin/accounts`,
        `${pathAdmin}/admin/accounts`,
      ]);
      setCreators(creatorsRes?.data || []);

      // Categories: prefer hierarchical parent tree for readable dropdown
      const categoriesRes = await fetchFirstOk([
        `${pathAdmin}/admin/categories/parent`,
        `${pathAdmin}/v1/admin/categories/parent`,
        `${pathAdmin}/v1/admin/categories`,
        `${pathAdmin}/admin/categories`,
      ]);
      setCategories(categoriesRes?.data || []);

      // Collections
      const collectionsRes = await fetchFirstOk([
        `${pathAdmin}/v1/admin/collections`,
        `${pathAdmin}/admin/collections`,
      ]);
      setCollections(collectionsRes?.data || []);

      // Materials
      const materialsRes = await fetchFirstOk([
        `${pathAdmin}/v1/admin/materials`,
        `${pathAdmin}/admin/materials?limit=1000`,
        `${pathAdmin}/admin/materials`,
      ]);
      const mats = materialsRes?.data || [];
      // normalize to array of { _id?, name }
      setMaterials(Array.isArray(mats) ? mats : []);
    })();
  }, []);

  // getDisplayPrice moved to src/helpers/price.js

  const getTotalSold = (item) => {
    const soldFromVariants = (item?.variants || []).reduce(
      (sum, v) => sum + (Number(v?.sold) || 0),
      0,
    );
    if (soldFromVariants > 0) return soldFromVariants;
    if (Number.isFinite(Number(item?.totalSold))) return Number(item.totalSold);
    if (Number.isFinite(Number(item?.sold))) return Number(item.sold);
    return 0;
  };

  const handleResetFilters = () => {
    resetFilterValues();
    setKeyword("");
    setKeywordInput("");
    setPage(1);
  };

  // normalizeText is kept for future keyword/search helpers
  void normalizeText;

  const renderCategoryOptions = (cats, level = 0) => {
    if (!Array.isArray(cats)) return null;
    return cats
      .slice()
      .sort((a, b) =>
        String(a?.name || "").localeCompare(String(b?.name || "")),
      )
      .map((c) => {
        const id = c?._id || c?.id;
        const name = c?.name || "";
        const children = c?.children;
        return (
          <React.Fragment key={String(id)}>
            <option value={String(id)}>
              {"--".repeat(level)} {name}
            </option>
            {Array.isArray(children) && children.length
              ? renderCategoryOptions(children, level + 1)
              : null}
          </React.Fragment>
        );
      });
  };

  const getCategoryDescendantIds = (cats, rootId) => {
    const want = String(rootId || "");
    if (!want) return [];

    // Case 1: tree shape: [{ _id/id, children: [...] }]
    const findNodeInTree = (nodes) => {
      if (!Array.isArray(nodes)) return null;
      for (const n of nodes) {
        const id = n?._id || n?.id;
        if (String(id) === want) return n;
        const hit = findNodeInTree(n?.children);
        if (hit) return hit;
      }
      return null;
    };

    const node = findNodeInTree(cats);
    if (node) {
      const out = new Set();
      const walk = (n) => {
        if (!n) return;
        const id = n?._id || n?.id;
        if (id != null) out.add(String(id));
        const children = Array.isArray(n?.children) ? n.children : [];
        for (const ch of children) walk(ch);
      };
      walk(node);
      return Array.from(out);
    }

    // Case 2: flat shape: [{ _id, parent/parentId }, ...]
    const list = Array.isArray(cats) ? cats : [];
    const childrenByParent = new Map();
    for (const c of list) {
      const pid = c?.parent?._id || c?.parentId || c?.parent || null;
      const parentKey = pid == null ? "" : String(pid);
      const id = c?._id || c?.id;
      if (id == null) continue;
      if (!childrenByParent.has(parentKey)) childrenByParent.set(parentKey, []);
      childrenByParent.get(parentKey).push(String(id));
    }

    const out = new Set([want]);
    const queue = [want];
    while (queue.length) {
      const cur = queue.shift();
      const kids = childrenByParent.get(String(cur)) || [];
      for (const k of kids) {
        if (out.has(k)) continue;
        out.add(k);
        queue.push(k);
      }
    }
    return Array.from(out);
  };

  const buildProductParams = (withPagination = true, exportLimit = 10000) => {
    const params = new URLSearchParams();
    // admin endpoints keep legacy behavior; do not request client-facing facets here
    const trimmedKeyword = String(keyword || "").trim();
    if (trimmedKeyword) params.append("keyword", trimmedKeyword);
    if (creatorFilter) params.append("createdBy", creatorFilter);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    if (stockFilter) params.append("stockStatus", stockFilter);
    if (categoryFilter) {
      const ids = getCategoryDescendantIds(categories, categoryFilter);
      const list = ids && ids.length ? ids : [String(categoryFilter)];
      // Some backends parse repeated query keys into an array (categoryId=..&categoryId=..)
      // while others only support a single categoryId. Using repeated keys keeps leaf behavior
      // and enables parent->descendants filtering on array-aware servers.
      for (const id of list) params.append("categoryId", String(id));
    }
    if (collectionFilter)
      params.append("collectionId", String(collectionFilter));
    if (materialFilter) params.append("material", materialFilter);

    if (withPagination) {
      params.append("page", String(page));
      params.append("limit", String(limit));
    } else {
      params.append("page", "1");
      params.append("limit", String(exportLimit));
    }
    return params;
  };

  const fetchProductsFirstOk = async ({ params, token, signal }) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    };
    const tryUrls = [
      `${pathAdmin}/v1/admin/products?${params.toString()}`,
      `${pathAdmin}/admin/products?${params.toString()}`,
    ];

    for (const url of tryUrls) {
      const res = await fetch(url, {
        method: "GET",
        headers,
        credentials: "include",
        signal,
      });
      if (res.status === 404) continue;
      const json = await res.json();
      if (json?.code === "error") continue;
      return json;
    }
    return null;
  };

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem("token");
      const params = buildProductParams(false);
      const headers = {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      };

      const tryUrls = [
        `${pathAdmin}/v1/admin/products?${params.toString()}`,
        `${pathAdmin}/admin/products?${params.toString()}`,
      ];

      let data = null;
      for (const url of tryUrls) {
        const res = await fetch(url, {
          method: "GET",
          headers,
          credentials: "include",
        });
        if (res.status === 404) continue;
        data = await res.json();
        if (data?.code === "error") continue;
        break;
      }

      if (!data) throw new Error("Không thể tải danh sách sản phẩm");
      const exportProducts = data?.data || [];

      if (!exportProducts.length) {
        alert("Không có dữ liệu để xuất Excel");
        return;
      }

      const rows = exportProducts.map((item, index) => {
        const totalStock = (item?.variants || []).reduce(
          (sum, v) => sum + (v?.quantity || 0),
          0,
        );
        const totalSold = getTotalSold(item);

        return {
          STT: index + 1,
          "Mã sản phẩm": item?._id || "",
          "Tên sản phẩm": item?.name || "",
          "Ngày tạo": item?.createdAt
            ? new Date(item.createdAt).toLocaleDateString("vi-VN")
            : "",
          "Người tạo":
            item?.createdBy?.fullName || item?.createdBy?.email || "",
          "Tồn kho": totalStock,
          "Đã bán": totalSold,
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

      const now = new Date();
      const fileName = `danh-sach-san-pham-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Export excel failed", error);
      alert("Xuất Excel thất bại");
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem("token");

    setLoading(true);


    (async () => {
      try {
        const params = buildProductParams(true);
        const data = await fetchProductsFirstOk({
          params,
          token,
          signal: controller.signal,
        });

        // Handle explicit permission error returned by backend
        if (data && data.success === false && data.error === 'insufficient_permissions') {
          // Clear token and redirect to login so admin can re-authenticate
          try { localStorage.removeItem('token'); sessionStorage.removeItem('admin_profile_cache'); } catch (e) { }
          alert('Bạn không có đủ quyền truy cập. Vui lòng đăng nhập lại với tài khoản quản trị.');
          navigate('/admin/authen/login');
          return;
        }

        if (!data) throw new Error("Failed to fetch");

        const serverProducts = data?.data || [];
        const serverTotal = data?.total || 0;
        const serverTotalPage = data?.totalPage || 1;

        // Fallback: some backends don't support keyword search consistently (or are accent/whitespace sensitive).
        // If keyword is set but server returns nothing, we fetch a larger list and filter client-side.
        const trimmedKeyword = String(keyword || "").trim();
        if (trimmedKeyword && !serverProducts.length) {
          const fallbackParams = buildProductParams(false, 5000);
          fallbackParams.delete("keyword");

          const allData = await fetchProductsFirstOk({
            params: fallbackParams,
            token,
            signal: controller.signal,
          });

          const allProducts = allData?.data || [];
          const kw = normalizeForSearch(trimmedKeyword);
          const matched = allProducts.filter((p) =>
            normalizeForSearch(p?.name).includes(kw),
          );

          const start = (page - 1) * limit;
          const pageItems = matched.slice(start, start + limit);
          setProducts(pageItems);
          setTotal(matched.length);
          setTotalPage(Math.max(1, Math.ceil(matched.length / limit)));
        } else {
          setProducts(serverProducts);
          setTotal(serverTotal);
          setTotalPage(serverTotalPage);
        }
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("Fetch products failed", err);
        alert(err?.message || "Failed to fetch");
        setProducts([]);
        setTotal(0);
        setTotalPage(1);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [
    keyword,
    creatorFilter,
    startDate,
    endDate,
    minPrice,
    maxPrice,
    stockFilter,
    categoryFilter,
    collectionFilter,
    materialFilter,
    page,
    limit,
  ]);

  // no client-facing facet selections in admin UI

  return (
    <>
      <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
        <div className="sm:text-[30px] text-[20px] font-[700] mb-[30px]">
          Quản lý sản phẩm
        </div>

        {/* Use card prop on FilterBar and remove extra outer wrapper so border sizes to content */}
        <div>
          <FilterBar
            card={true}
              fields={[
                {
                  name: 'creatorFilter', type: 'custom', render: (v, onChange) => (
                    <select value={v || ''} onChange={(e) => onChange(e.target.value)} className="font-semibold text-black outline-none text-sm w-[90px]">
                      <option value="">Người tạo</option>
                      {creators.slice().sort((a, b) => String(a?.fullName || a?.email || "").localeCompare(String(b?.fullName || b?.email || ""))).map(creator => {
                        const id = creator?._id || creator?.id; const label = creator?.fullName || creator?.email || String(id || "");
                        return <option key={String(id)} value={String(id)}>{label}</option>
                      })}
                    </select>
                  )
                },
                {
                  name: 'categoryFilter', type: 'custom', render: (v, onChange) => (
                    <select value={v || ''} onChange={(e) => onChange(e.target.value)} className="font-semibold outline-none text-sm w-[140px]">
                      <option value="">Tất cả danh mục</option>
                      {Array.isArray(categories) && categories.some(c => Array.isArray(c?.children) && c.children.length) ? renderCategoryOptions(categories) : categories.slice().sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || ""))).map(cat => (<option key={String(cat?._id || cat?.id)} value={String(cat?._id || cat?.id)}>{cat?.name}</option>))}
                    </select>
                  )
                },
                { name: 'collectionFilter', type: 'select', options: [{ label: 'Tất cả bộ sưu tập', value: '' }, ...collections.map(c => ({ label: c.name, value: c._id }))] },
                {
                  name: 'stockFilter',
                  type: 'custom',
                  className: 'py-2 px-2 border-r border-gray-300 !w-[100px] min-w-[110px] flex items-center',
                  render: (v, onChange) => (
                    <select
                      value={v || ''}
                      onChange={(e) => onChange(e.target.value)}
                      className="font-semibold text-sm w-full outline-none bg-transparent cursor-pointer"
                    >
                      <option value="">Tất cả kho</option>
                      <option value="in_stock">In stock</option>
                      <option value="low_stock">Low stock</option>
                      <option value="out_of_stock">Out of stock</option>
                    </select>
                  )
                },
                // { name: 'materialFilter', type: 'select', options: [{ label: 'Tất cả chất liệu', value: '' }, ...((materials && materials.length ? materials : [{ name: 'Vàng' }, { name: 'Vàng hồng' }, { name: 'Bạc' }]).slice().sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || ""))).map(m => ({ label: m?.name || '', value: m?._id || m?.name || '' })))] },
                {
                  name: 'materialFilter',
                  type: 'custom',
                  className: 'py-2 px-2 border-r border-gray-300 !w-[100px] min-w-[150px] flex items-center',
                  render: (v, onChange) => (
                    <select
                      value={v || ''}
                      onChange={(e) => onChange(e.target.value)}
                      className="font-semibold text-sm w-full outline-none bg-transparent cursor-pointer"
                    >
                      <option value="">Tất cả chất liệu</option>
                      <option value="gold">Vàng</option>
                      <option value="rose_gold">Vàng hồng</option>
                      <option value="silver">Bạc</option>
                    </select>
                  )
                },
                {
                  name: 'minPrice', type: 'custom', render: (v, onChange) => (
                    <div className="flex items-center gap-[5px]"><input type="number" value={v || ''} onChange={(e) => onChange(e.target.value)} placeholder="Min" className="font-[700] outline-none text-[12px] w-[90px] px-[5px] py-[4px] border border-gray-200 rounded" /></div>
                  )
                },
                {
                  name: 'maxPrice', type: 'custom', render: (v, onChange) => (
                    <input type="number" value={v || ''} onChange={(e) => onChange(e.target.value)} placeholder="Max" className="font-[700] outline-none text-[12px] w-[90px] px-[5px] py-[4px] border border-gray-200 rounded" />
                  )
                },
                { name: 'dateRange', type: 'date-range' },
              ]}
              values={filterValues}
              onChange={(v) => { setPage(1); onFilterChange(v); }}
              onReset={() => { resetFilterValues(); setKeyword(''); setKeywordInput(''); setPage(1); }}
            />
        </div>

        <div className="flex gap-[20px] items-center mt-[20px] flex-wrap">
          <div className="flex gap-[10px] items-center bg-[white] py-[20px] px-[20px] rounded-[10px] border border-gray-300">
            <CiSearch />
            <input
              className="placeholder:text-[14px] text-[14px] outline-none w-[300px]"
              placeholder="Tìm kiếm"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  setKeyword(String(keywordInput || "").trim());
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

          <button
            type="button"
            onClick={handleExportExcel}
            className="text-[white] text-[14px] bg-[#0f766e] hover:bg-[#115e59] py-[20px] px-[25px] rounded-[10px] border border-gray-300"
          >
            Xuất Excel
          </button>
        </div>

        <div className="mt-[20px]">
          <div className="flex flex-col px-[30px] bg-[white] py-[30px] rounded-[20px]">
            <div className="overflow-x-auto">
              <table className="xl:w-full w-[1100px]">
                <thead className="bg-[#e5e1e1] ">
                  <tr>

                    <td className="rounded-l-[10px] p-[15px] text-[14px] font-[600] py-[10px] w-[90px]">
                      Ảnh
                    </td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[360px]">
                      Tên sản phẩm
                    </td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[100px]">
                      Khắc
                    </td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[160px]">
                      Tên danh mục
                    </td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[220px]">
                      Bộ sưu tập
                    </td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[200px]">
                      Giá
                    </td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[100px]">
                      Tồn kho
                    </td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[100px]">
                      Đã bán
                    </td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[100px]">
                      Ngày tạo
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
                  ) : products.length ? (
                    products.map((item) => (
                      <tr key={item._id}>

                        <td className="p-[15px] text-[14px]">
                          <img
                            src={item.variants?.[0]?.images?.[0]}
                            alt={item.name}
                            className="w-[60px] h-[60px] object-cover rounded"
                          />
                        </td>
                        <td className="p-[15px] text-[14px]">{item.name}</td>
                        <td className="p-[15px] text-[14px]">
                          {item?.engraving?.enabled ? (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-semibold">
                              Khắc
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-[15px] text-[14px]">
                          {item.category.name}
                        </td>
                        <td className="p-[15px] text-[14px]">
                          {(item.collections || [])
                            .map((c) => c?.name)
                            .filter(Boolean)
                            .join(", ") || ""}
                        </td>
                        <td className="p-[15px] text-[14px]">
                          {getDisplayPrice(item, formatPrice)}
                        </td>
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
                              const total = (item?.variants || []).reduce(
                                (sum, v) => sum + (v?.quantity || 0),
                                0,
                              );
                              return total;
                            })()}
                          </span>
                        </td>
                        <td className="p-[15px] text-[14px]">
                          {getTotalSold(item)}
                        </td>
                        <td className="p-[15px] text-[14px]">
                          {formatDate(item.createdAt)}
                        </td>

                        <td className="p-[15px]">
                          <div className="flex">
                            <Link
                              to={`/admin/product/update/${item._id}`}
                              className="rounded-l-[10px] text-[14px] p-[15px] bg-[white] border-y border-l border-gray-300"
                            >
                              <FaRegEdit className="text-[16px] font-[700]" />
                            </Link>
                            <ProductDelete
                              product={item}
                              onDeleted={handleDeletedSuccess}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9">
                        <div className="flex items-center justify-center gap-[10px] py-[30px] text-[14px] text-gray-500">
                          <CiSearch className="md:text-[20px] text-[18px]" />
                          <span className="md:text-[16px] text-[14px]">
                            Không tìm thấy sản phẩm
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

        <Pagination page={page} totalPage={totalPage} total={total} limit={limit} onChange={setPage} />
      </div>
    </>
  );
}
