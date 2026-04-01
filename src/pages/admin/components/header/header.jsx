import { IoMdMenu } from "react-icons/io";
import { useEffect, useState } from 'react'
import { pathAdmin } from "../../../../config/api"
const Header = ()=>{
    const [user, setUser] = useState({});
    useEffect(() => {
        fetch(`${pathAdmin}/admin/account/user`, {
            method: "GET",
            credentials: "include"
        })
        .then(res => res.json())
        .then(data => {
            setUser(data.data)
        })
        .catch(err => console.log(err))
    }, [])
    const openMenu =()=>{
        const menuView = document.querySelector("[menu-view]")
        const overLay = document.querySelector("[over-lay]")
        menuView?.classList.remove("-translate-x-full")
        overLay?.classList.remove("hidden")
    }
    const overLay = ()=>{
        const menuView = document.querySelector("[menu-view]")
        const overLay = document.querySelector("[over-lay]")
        menuView?.classList.add("-translate-x-full")
        overLay?.classList.add("hidden")
    }
    return(
        <>
            <div className="z-100 fixed top-0 left-0 right-0 lg:px-[60px] sm:px-[40px] px-[16px] py-[5px] bg-white flex justify-between items-center border-b border-b-gray-300">
                <img className="w-[100px]" src="/client/images/logo.jpg" alt="" />
                <div className="flex items-center gap-[10px]">
                    <img className="md:w-[50px] md:h-[50px] w-[30px] h-[30px]" src="/image/user.png" alt="" />
                    <div className="flex flex-col">
                        <span className="sm:text-[14px] text-[10px] font-[700]">{user?.fullName}</span>
                        <span className="sm:text-[14px] text-[10px]">None</span>
                    </div>
                    <IoMdMenu onClick={openMenu} className="lg:hidden block md:ml-[20px] ml-[5px] md:text-[36px] text-[30px]"/>
                </div>
            </div>
            <div onClick={overLay} over-lay="true" className="hidden z-100 inset-0 fixed">
                <div className="bg-[#f8f8f8] opacity-[0.4] inset-0 fixed"></div>
            </div>
        </>
    )
}
export default Header;