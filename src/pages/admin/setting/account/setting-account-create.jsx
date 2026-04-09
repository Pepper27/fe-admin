import { useEffect, useState } from "react";
import { pathAdmin } from "../../../../config/api";
import { useNavigate } from "react-router-dom";

export default function SettingAccountCreate() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    positionCompany: "",
    status: "initial",
    password: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${pathAdmin}/admin/roles/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setRoles(Array.isArray(data?.data) ? data.data : []))
      .catch(() => setRoles([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const body = new FormData();
      Object.keys(form).forEach((key) => body.append(key, form[key]));
      if (avatarFile) body.append("avatar", avatarFile);

      const response = await fetch(`${pathAdmin}/admin/account`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body,
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.code === "error") {
        throw new Error(data?.message || "Tạo tài khoản thất bại!");
      }
      navigate("/admin/setting/account");
    } catch (error) {
      alert(error?.message || "Tạo tài khoản thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]"
    >
      <div className="sm:text-[30px] text-[20px] font-[700] mb-[30px]">
        Tạo tài khoản nội bộ
      </div>

      <div className="mb-[30px] grid sm:grid-cols-2 grid-cols-1 gap-[20px] bg-white py-[30px] px-[20px] border border-gray-300 rounded-[15px]">
        <input className="px-[16px] py-[12px] bg-[#F5F6FA] rounded-[5px] border border-gray-300 outline-none" placeholder="Họ tên" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
        <input className="px-[16px] py-[12px] bg-[#F5F6FA] rounded-[5px] border border-gray-300 outline-none" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        <input className="px-[16px] py-[12px] bg-[#F5F6FA] rounded-[5px] border border-gray-300 outline-none" placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
        <input className="px-[16px] py-[12px] bg-[#F5F6FA] rounded-[5px] border border-gray-300 outline-none" placeholder="Chức vụ" value={form.positionCompany} onChange={(e) => setForm((p) => ({ ...p, positionCompany: e.target.value }))} />
        <select className="px-[16px] py-[12px] bg-[#F5F6FA] rounded-[5px] border border-gray-300 outline-none" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
          <option value="">-- Chọn nhóm quyền --</option>
          {roles.map((role) => (
            <option key={role._id} value={role._id}>
              {role.name}
            </option>
          ))}
        </select>
        <select className="px-[16px] py-[12px] bg-[#F5F6FA] rounded-[5px] border border-gray-300 outline-none" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
          <option value="initial">Khởi tạo</option>
          <option value="active">Hoạt động</option>
        </select>
        <input className="sm:col-span-2 px-[16px] py-[12px] bg-[#F5F6FA] rounded-[5px] border border-gray-300 outline-none" placeholder="Mật khẩu" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
        <div className="sm:col-span-2">
          <label className="text-[13px] mb-[6px] block">Ảnh đại diện</label>
          <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
        </div>
      </div>

      <div className="mt-[10px] flex flex-col items-center gap-y-[20px]">
        <button
          type="submit"
          disabled={submitting}
          className="sm:w-[270px] w-[220px] hover:bg-second rounded-[10px] sm:text-[20px] text-[16px] text-white bg-pri px-[20px] py-[16px] disabled:opacity-50"
        >
          {submitting ? "Đang tạo..." : "Tạo mới"}
        </button>
        <a href="/admin/setting/account" className="text-pri hover:text-second sm:text-[20px] text-[16px] underline">
          Quay lại danh sách
        </a>
      </div>
    </form>
  );
}
