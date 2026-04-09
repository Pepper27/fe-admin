import { MdSpaceDashboard, MdCategory, MdOutlinePets } from "react-icons/md";
import { IoIosListBox, IoMdSettings } from "react-icons/io";
import { FaUserCog, FaBlog } from "react-icons/fa";
import { GrPowerShutdown } from "react-icons/gr";
import { AiFillProduct } from "react-icons/ai";
import { FaPalette } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { pathAdmin } from "../../../../config/api";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [permissions, setPermissions] = useState([]);

  const arrayLink = [
    { icon: MdSpaceDashboard, href: "/admin/dashboard", title: "Tổng quan", permission: "dashboard-view" },
    { icon: MdCategory, href: "/admin/category", title: "Quản lý danh mục", permission: "category-view" },
    { icon: MdOutlinePets, href: "/admin/collection", title: "Quản lý bộ sưu tập",permission: "collection-view"  },
    { icon: AiFillProduct, href: "/admin/product", title: "Quản lý sản phẩm", permission: "product-view" },
    { icon: FaPalette, href: "/admin/design", title: "Quản lý My designs",permission: "my-designs-view" },
    { icon: IoIosListBox, href: "/admin/order", title: "Quản lý đơn hàng", permission: "order-view" },
    { icon: FaBlog, href: "/admin/blog", title: "Quản lý bài viết", permission: "new-view" },
    { icon: FaUsers, href: "/admin/client", title: "Quản lý account", permission: "user-view" },
    { icon: FaRegHeart, href: "/admin/wishlist", title: "Thống kê Wishlist",permission: "wishlist-view" },
    {
      icon: IoMdSettings,
      href: "/admin/setting",
      title: "Cài đặt chung",
      anyPermissions: ["setting-view", "role-view", "account-view", "info-view"],
    },
    { icon: FaUserCog, href: "/admin/profile", title: "Thông tin cá nhân" },
  ];

  useEffect(() => {
    const cacheRaw = sessionStorage.getItem("admin_profile_cache");
    if (cacheRaw) {
      try {
        const parsed = JSON.parse(cacheRaw);
        if (Array.isArray(parsed?.permissions)) {
          setPermissions(parsed.permissions);
        }
      } catch {
        // noop
      }
    }

    const token = localStorage.getItem("token");
    fetch(`${pathAdmin}/admin/account/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const nextPermissions = Array.isArray(data?.data?.permissions)
          ? data.data.permissions
          : [];
        setPermissions(nextPermissions);
        sessionStorage.setItem(
          "admin_profile_cache",
          JSON.stringify({ permissions: nextPermissions })
        );
      })
      .catch(() => setPermissions([]));
  }, []);

  const visibleLinks = useMemo(() => {
    return arrayLink.filter((item) => {
      if (item.permission) return permissions.includes(item.permission);
      if (item.anyPermissions) {
        return item.anyPermissions.some((p) => permissions.includes(p));
      }
      return true;
    });
  }, [arrayLink, permissions]);

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${pathAdmin}/admin/account/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        credentials: "include",
      });

      const data = await res.json();
      if (data.code === "success") {
        sessionStorage.removeItem("admin_profile_cache");
        localStorage.removeItem("token");
        navigate("/admin/authen/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

 return(
    <>
      <div menu-view="true" className="lg:z-[9999] z-[99999] lg:flex  transform lg:-translate-x-0 -translate-x-full transition-transform duration-600 ease-in-out  fixed top-0 left-0 custom-scroll overflow-y-auto sm:pl-[20px] pl-[10px] pt-[20px] bg-[white] sm:w-[270px] w-[240px] h-full border-r border-r-gray-200">
        <div className="flex flex-col ">
          {
            visibleLinks.map((item,index)=>{
              const Icon= item.icon
              const isActive = location.pathname.includes(item.href);
              return(        
                <div key={index} className={isActive?"active mb-[10px] flex gap-[5px] items-center py-[13px] pl-[20px] pr-[50px] mr-[10px] rounded-[8px] hover:bg-pri hover:text-[white] cursor-pointer":"cursor-pointer mb-[10px] hover:text-[white] hover:bg-pri flex gap-[5px] items-center py-[13px] pl-[20px] pr-[50px] mr-[10px] rounded-[8px]"}>
                  <Icon className="sm:text-[20px] text-[16px]" />
                  <a href={item.href} className="sm:text-[14px] text-[12px]"> {item.title}</a>
                </div>
              )
            }
          )}
          <div className="cursor-pointer flex gap-[5px] items-center py-[13px] px-[20px] mr-[10px] rounded-[8px]">
            <GrPowerShutdown className="text-[red] text-[20px]" />
            <div onClick={logout} className="text-[red] sm:text-[14px] text-[12px]"> Đăng xuất</div>
          </div>
        </div>
      </div>
    </>
  )
};
export default Sidebar;
