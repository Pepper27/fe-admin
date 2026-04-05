import { FaFilter } from "react-icons/fa6";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { pathAdmin } from "../../../config/api";
import ProductDelete from "./product-delete";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeletedSuccess = (deletedId) => {
    setProducts((prev) => prev.filter((item) => item._id !== deletedId));
  };

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem("token");

    setLoading(true);
    fetch(`${pathAdmin}/admin/products?keyword=${encodeURIComponent(keyword)}`, {
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
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        console.error("Fetch products failed", err);
        alert(err?.message || "Failed to fetch");
        setProducts([]);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [keyword]);

  return (
    <>
      <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
        <div className="sm:text-[30px] text-[20px] font-[700] mb-[30px]">Quản lý sản phẩm</div>

        <div className="inline-flex lg:w-[840px] w-full flex-wrap gap-[20px] bg-[white] items-center rounded-[10px] border-[1px] border-gray-300">
          <div className="py-[20px] px-[30px] flex gap-[5px] items-center border-r-[1px] border-r-gray-300">
            <FaFilter className="text-[18px]" />
            <span className="font-[700] text-[14px]">Bộ lọc</span>
          </div>
          <div className="py-[20px] px-[20px] border-r-[1px] border-r-gray-300">
            <select className="font-[700] outline-none text-[14px] mr-[7px] w-[120px] ">
              <option value="">Người tạo</option>
            </select>
          </div>
          <div className="py-[20px] px-[20px] border-r-[1px] border-r-gray-300 flex items-center">
            <input type="date" className="font-[700] text-[14px] outline-none" />
            <span className="mx-[10px]">-</span>
            <input type="date" className="font-[700] text-[14px] outline-none" />
          </div>
          <div className="w-[150px] py-[20px] pl-[10px] pr-[30px] flex gap-[5px] items-center text-[red] font-[700] text-[14px]">
            <MdDelete className="text-[16px]" />
            <div>Xóa lọc</div>
          </div>
        </div>

        <div className="flex gap-[20px] items-center mt-[20px] flex-wrap">
          <div className="flex gap-[10px] items-center bg-[white] py-[20px] px-[20px] rounded-[10px] border border-gray-300">
            <CiSearch />
            <input
              className="placeholder:text-[14px] text-[14px] outline-none w-[300px]"
              placeholder="Tìm kiếm"
              onKeyDown={(e) => {
                if (e.key === "Enter") setKeyword(e.target.value);
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
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[200px]">Tên danh mục</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[140px]">Giá</td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[100px]">Tồn kho</td>
                    <td className="p-[15px] text-[14px] font-[600] rounded-r-[10px] py-[10px] w-[140px]">Hành động</td>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="p-[15px] text-[14px] text-gray-500">
                        Đang tải...
                      </td>
                    </tr>
                  ) : products?.length ? (
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
                        <td className="p-[15px] text-[14px]">{item.variants?.[0]?.price}</td>
                        <td className="p-[15px] text-[14px]">{item.variants?.[0]?.quantity}</td>
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
                      <td colSpan="5">
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
      </div>
    </>
  );
}
