import { useEffect, useState } from "react";
import { pathAdmin } from "../../../config/api";

export default function SettingInfoWebsite() {
  const [form, setForm] = useState({
    websiteName: "",
    phone: "",
    email: "",
    address: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [faviconPreview, setFaviconPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${pathAdmin}/admin/settings/website-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const info = data?.data || {};
        setForm({
          websiteName: info.websiteName || "",
          phone: info.phone || "",
          email: info.email || "",
          address: info.address || "",
        });
        setLogoPreview(info.logo || "");
        setFaviconPreview(info.favicon || "");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const body = new FormData();
      Object.keys(form).forEach((key) => body.append(key, form[key]));
      if (logoFile) body.append("logo", logoFile);
      if (faviconFile) body.append("favicon", faviconFile);

      const response = await fetch(`${pathAdmin}/admin/settings/website-info`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body,
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.code === "error") {
        throw new Error(data?.message || "Cập nhật thất bại!");
      }
      alert(data?.message || "Cập nhật thành công!");
    } catch (error) {
      alert(error?.message || "Cập nhật thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]"
    >
      <div className="sm:text-[30px] text-[20px] font-[700] mb-[30px]">
        Thông tin website
      </div>

      <div className="mb-[30px] grid sm:grid-cols-2 grid-cols-1 gap-[20px] bg-white py-[30px] px-[20px] border border-gray-300 rounded-[15px]">
        <input className="px-[16px] py-[12px] bg-[#F5F6FA] rounded-[5px] border border-gray-300 outline-none" placeholder="Tên website" value={form.websiteName} onChange={(e) => setForm((p) => ({ ...p, websiteName: e.target.value }))} />
        <input className="px-[16px] py-[12px] bg-[#F5F6FA] rounded-[5px] border border-gray-300 outline-none" placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
        <input className="px-[16px] py-[12px] bg-[#F5F6FA] rounded-[5px] border border-gray-300 outline-none" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        <input className="px-[16px] py-[12px] bg-[#F5F6FA] rounded-[5px] border border-gray-300 outline-none" placeholder="Địa chỉ" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />

        <div>
          <label className="text-[13px] mb-[6px] block">Logo</label>
          {logoPreview ? <img src={logoPreview} alt="logo" className="w-[80px] h-[80px] object-cover border mb-[8px]" /> : null}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setLogoFile(file);
              if (file) setLogoPreview(URL.createObjectURL(file));
            }}
          />
        </div>

        <div>
          <label className="text-[13px] mb-[6px] block">Favicon</label>
          {faviconPreview ? <img src={faviconPreview} alt="favicon" className="w-[80px] h-[80px] object-cover border mb-[8px]" /> : null}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setFaviconFile(file);
              if (file) setFaviconPreview(URL.createObjectURL(file));
            }}
          />
        </div>
      </div>

      <div className="mt-[10px] flex flex-col items-center gap-y-[20px]">
        <button
          type="submit"
          disabled={submitting}
          className="sm:w-[270px] w-[220px] hover:bg-second rounded-[10px] sm:text-[20px] text-[16px] text-white bg-pri px-[20px] py-[16px] disabled:opacity-50"
        >
          {submitting ? "Đang cập nhật..." : "Cập nhật"}
        </button>
        <a href="/admin/setting" className="text-pri hover:text-second sm:text-[20px] text-[16px] underline">
          Quay lại danh sách
        </a>
      </div>
    </form>
  );
}
