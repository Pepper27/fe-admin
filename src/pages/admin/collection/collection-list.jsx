import { FaFilter } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";

import { useEffect, useState, useRef } from "react";
import Pagination from '../../../components/Pagination'
import { Link } from "react-router-dom";
import { pathAdmin } from "../../../config/api";
import CollectionDelete from "./collection-delete";
import { ADMIN_LIST_LIMIT, paginateItems, sortByCreatedDesc } from '../../../helpers/adminList';


export default function CollectionList() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [key, setKey] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const fetchControllerRef = useRef(null)
  const limit = 10;

  const fetchCollections = (overrides = {}) => {
    const token = localStorage.getItem("token");
    setLoading(true);
    const usePage = overrides.page ?? page
    const useKey = overrides.keyword ?? key
    try { fetchControllerRef.current?.abort(); } catch(e) {}
    const controller = new AbortController()
    fetchControllerRef.current = controller

    fetch(
      `${pathAdmin}/admin/collections?page=1&limit=${ADMIN_LIST_LIMIT}&keyword=${encodeURIComponent(useKey)}`,

      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        credentials: "include",

        signal: controller.signal,

      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.code === "error")
          throw new Error(data.message || "Unauthorized");

        const allCollections = sortByCreatedDesc(data?.data || []);
        const computedTotalPage = Math.max(1, Math.ceil(allCollections.length / limit));
        setCollections(paginateItems(allCollections, usePage, limit));
        setTotalPage(computedTotalPage);
        setTotal(allCollections.length);
        if (usePage > computedTotalPage && computedTotalPage > 0) {
          setPage(computedTotalPage)
          return
        }
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return

        console.error("Fetch collections failed", err);
        alert(err?.message || "Failed to fetch");
        setCollections([]);
        setTotal(0);
        setTotalPage(1);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCollections();
  }, [page, key]);

  return (
    <>
      <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
        <div className="sm:text-[30px] text-[20px] font-[700]">
          Quản lý bộ sưu tập
        </div>

        <div className="flex gap-[20px] items-center mt-[20px] flex-wrap">
          <div className="flex gap-[10px] items-center bg-[white] py-[20px] px-[20px] rounded-[10px] border border-gray-300">
            <CiSearch />
            <input

              value={searchInput}
              className="placeholder:text-[14px] text-[14px] outline-none w-[300px]"
              placeholder="Tìm kiếm"
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  setKey(searchInput);

                }
              }}
            />
          </div>

          <div className="flex items-center gap-[10px]">
            {searchInput !== '' && (
              <button
                onClick={() => {
                  setSearchInput('')
                  setKey('')
                  setPage(1)
                  fetchCollections({ page: 1, keyword: '' })
                }}
                className="flex items-center gap-[8px] text-[#ff2d2d] hover:opacity-90 bg-white border border-gray-200 rounded-[10px] py-[18px] px-[16px] text-[16px]"
                title="Xóa lọc"
              >
                <MdDelete className="text-[18px]" />
                <span className="text-[14px] font-[700]">Xóa lọc</span>
              </button>
            )}
            <Link
              to="/admin/collection/create"
              className="text-[white] text-[14px] hover:bg-second bg-pri py-[20px] px-[25px] rounded-[10px] border border-gray-300"
            >
              + Tạo mới
            </Link>
          </div>

        </div>

        <div className="mt-[20px]">
          <div className="flex flex-col px-[30px] bg-[white] py-[30px] rounded-[20px]">
            <div className="overflow-x-auto">
              <table className="xl:w-full w-[1100px]">
                <thead className="bg-[#e5e1e1] ">
                  <tr>
              
                    <td className="rounded-l-[10px] p-[15px] text-[14px] font-[600] py-[10px] w-[220px]">
                      Tên bộ sưu tập
                    </td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[190px]">
                      Ảnh/Poster
                    </td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[160px]">
                      Video
                    </td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[250px]">
                      Mô tả
                    </td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[180px]">
                      Tạo bởi
                    </td>
                    <td className="p-[15px] text-[14px] font-[600] py-[10px] w-[180px]">
                      Cập nhật bởi
                    </td>
                    <td className="p-[15px] text-[14px] font-[600] rounded-r-[10px] py-[10px]">
                      Hành động
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="p-[15px] text-[14px] text-gray-500"
                      >
                        Đang tải...
                      </td>
                    </tr>
                  ) : collections.length > 0 ? (
                    collections.map((item) => (
                      <tr key={item._id}>
                 
                        <td className="p-[15px] text-[14px] ">{item.name}</td>
                        <td className="p-[15px] ">
                          {item.avatar || item.poster ? (
                            <img
                              className="rounded-[10px] w-[120px]"
                              src={item.avatar || item.poster}
                              alt={item.name}
                            />
                          ) : (
                            <div className="text-[12px] text-gray-400">
                              (Chưa có)
                            </div>
                          )}
                        </td>
                        <td className="p-[15px] text-[14px]">
                          {item.video ? (
                            <div className="flex flex-col gap-y-[6px]">
                              <span className="inline-flex w-fit items-center rounded-full bg-emerald-100 px-[10px] py-[4px] text-[11px] font-[700] text-emerald-700">
                                Có video
                              </span>
                              <a
                                className="text-pri underline"
                                href={item.video}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Xem video
                              </a>
                            </div>
                          ) : (
                            <span className="text-[12px] text-gray-400">
                              (Không)
                            </span>
                          )}
                        </td>
                        <td className="p-[15px] text-[14px]">
                          <div className="line-clamp-2">
                            {item.description || ""}
                          </div>
                        </td>
                        <td className="p-[15px] pr-[25px]">
                          <div className="flex flex-col gap-y-[1px]">
                            <div className="text-[14px]">
                              {item.createdByName || ""}
                            </div>
                            <div className="text-[12px]">
                              {item.createdAtFormat || ""}
                            </div>
                          </div>
                        </td>
                        <td className="p-[15px] w-[160px] pr-[25px]">
                          <div className="flex flex-col gap-y-[1px]">
                            <div className="text-[14px]">
                              {item.updatedByName || ""}
                            </div>
                            <div className="text-[12px]">
                              {item.updatedAtFormat || ""}
                            </div>
                          </div>
                        </td>
                        <td className="p-[15px]">
                          <div className="flex">
                            <Link
                              to={`/admin/collection/update/${item._id}`}
                              className="rounded-l-[10px] text-[14px] p-[15px] bg-[white] border-y border-l border-gray-300"
                              title="Cập nhật"
                            >
                              <FaRegEdit className="text-[16px] font-[700]" />
                            </Link>
                            <CollectionDelete
                              collection={item}
                              onDeleted={fetchCollections}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">
                        <div className="flex items-center justify-center gap-[10px] py-[30px] text-[14px] text-gray-500">
                          <CiSearch className="md:text-[20px] text-[18px]" />
                          <span className="md:text-[16px] text-[14px]">
                            Không tìm thấy bộ sưu tập
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
