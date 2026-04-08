import { MdSpaceDashboard, MdCategory, MdOutlinePets } from "react-icons/md";
import { IoIosListBox, IoMdSettings } from "react-icons/io";
import { FaUserCog, FaBlog } from "react-icons/fa";
import { GrPowerShutdown } from "react-icons/gr";
import { AiFillProduct } from "react-icons/ai";
import { FaPalette } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";

import { useNavigate, useLocation } from "react-router-dom";
import { pathAdmin } from "../../../../config/api";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const arrayLink = [
    { icon: MdSpaceDashboard, href: "/admin/dashboard", title: "Tổng quan" },
    { icon: MdCategory, href: "/admin/category", title: "Quản lý danh mục" },
    { icon: AiFillProduct, href: "/admin/product", title: "Quản lý sản phẩm" },
    { icon: FaPalette, href: "/admin/design", title: "Quản lý My designs" },
    { icon: IoIosListBox, href: "/admin/order", title: "Quản lý đơn hàng" },
    { icon: FaBlog, href: "/admin/blog", title: "Quản lý bài viết" },
    { icon: FaUsers, href: "/admin/client", title: "Quản lý account" },
    { icon: IoMdSettings, href: "/admin/setting", title: "Cài đặt chung" },
    { icon: FaUserCog, href: "/admin/profile", title: "Thông tin cá nhân" },
  ];

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
        localStorage.removeItem("token");
        navigate("/admin/authen/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

 return(
    <>
      <div menu-view="true" className="lg:z-[9999] z-[99999] lg:flex  transform lg:-translate-x-0 -translate-x-full transition-transform duration-600 ease-in-out  fixed top-0 left-0 custom-scroll overflow-y-auto sm:pl-[20px] pl-[10px] pt-[20px] bg-[white] sm:w-[250px] w-[230px] h-full border-r border-r-gray-200">
        <div className="flex flex-col ">
          {
            arrayLink.map((item,index)=>{
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
