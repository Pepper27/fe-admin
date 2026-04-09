export default function SettingList() {
  const items = [
    {
      title: "Nhóm quyền",
      description: "Quản lý nhóm quyền",
      href: "/admin/role",
    },
    {
      title: "Tài khoản nội bộ",
      description: "Quản lý tài khoản quản trị và phân nhóm quyền",
      href: "/admin/setting/account",
    },
    {
      title: "Thông tin website",
      description: "Cập nhật thông tin hiển thị chung của website",
      href: "/admin/setting/website-info",
    },
  ];

  return (
    <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
      <div className="sm:text-[30px] text-[20px] font-[700] mb-[30px]">
        Cài đặt chung
      </div>

      <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-[20px]">
        {items.map((item) => (
          <a
            key={item.title}
            href={item.href}
            className="bg-white border border-gray-300 rounded-[14px] p-[20px] hover:border-pri hover:shadow-sm transition"
          >
            <div className="font-[700] text-[18px] text-pri">{item.title}</div>
            <div className="text-[14px] text-gray-600 mt-[8px]">
              {item.description}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
