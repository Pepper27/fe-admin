import { useEffect, useMemo, useState } from "react";
import { pathAdmin } from "../../../../config/api";
import { useNavigate, useParams } from "react-router-dom";

const PERMISSION_LIST = [
  { lable: "Xem trang tổng quan", value: "dashboard-view" },
  { lable: "Xem thống kê", value: "statistics-view" },
  { lable: "Xem danh mục", value: "category-view" },
  { lable: "Tạo danh mục", value: "category-create" },
  { lable: "Sửa danh mục", value: "category-edit" },
  { lable: "Xóa danh mục", value: "category-delete" },
  { lable: "Xem sản phẩm", value: "product-view" },
  { lable: "Tạo sản phẩm", value: "product-create" },
  { lable: "Sửa sản phẩm", value: "product-edit" },
  { lable: "Xóa sản phẩm", value: "product-delete" },
  { lable: "Xem bộ sưu tập", value: "collection-view" },
  { lable: "Tạo bộ sưu tập", value: "collection-create" },
  { lable: "Sửa bộ sưu tập", value: "collection-edit" },
  { lable: "Xóa bộ sưu tập", value: "collection-delete" },
  { lable: "Xem my designs", value: "my-designs-view" },
  { lable: "Tạo my designs", value: "my-designs-create" },
  { lable: "Sửa my designs", value: "my-designs-edit" },
  { lable: "Xóa my designs", value: "my-designs-delete" },
  { lable: "Xem thống kê wishlist", value: "wishlist-view" },
  { lable: "Xem khách hàng", value: "user-view" },
  { lable: "Sửa khách hàng", value: "user-edit" },
  { lable: "Xóa khách hàng", value: "user-delete" },
  { lable: "Thêm sự kiện cho sản phẩm", value: "product-event" },
  { lable: "Thùng rác sản phẩm", value: "product-trash" },
  { lable: "Xem đơn hàng", value: "order-view" },
  { lable: "Sửa đơn hàng", value: "order-edit" },
  { lable: "Xóa đơn hàng", value: "order-delete" },
  { lable: "Xem cài đặt", value: "setting-view" },
  { lable: "Xem thông tin website", value: "info-view" },
  { lable: "Xem tài khoản nội bộ", value: "account-view" },
  { lable: "Thêm tài khoản nội bộ", value: "account-create" },
  { lable: "Sửa tài khoản nội bộ", value: "account-edit" },
  { lable: "Xóa tài khoản nội bộ", value: "account-delete" },
  { lable: "Xem nhóm quyền", value: "role-view" },
  { lable: "Thêm nhóm quyền", value: "role-create" },
  { lable: "Sửa nhóm quyền", value: "role-edit" },
  { lable: "Xóa nhóm quyền", value: "role-delete" },
  { lable: "Xem bài viết", value: "new-view" },
  { lable: "Thêm bài viết", value: "new-create" },
  { lable: "Sửa bài viết", value: "new-edit" },
  { lable: "Xóa bài viết", value: "new-delete" },
  { lable: "Xem sự kiện", value: "event-view" },
  { lable: "Tạo sự kiện", value: "event-create" },
  { lable: "Sửa sự kiện", value: "event-edit" },
  { lable: "Xóa sự kiện", value: "event-delete" },
  { lable: "Quản lý Kích thước", value: "size-management" },
  { lable: "Quản lý Màu sắc", value: "color-management" },
  { lable: "Quản lý Chất liệu", value: "material-management" },
];

export default function RoleUpdate() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const permissionValues = useMemo(
    () => PERMISSION_LIST.map((p) => p.value),
    []
  );

  useEffect(() => {
    const fetchRoleDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(`${pathAdmin}/admin/roles/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          credentials: "include",
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.data) {
          throw new Error(data?.message || "Không lấy được thông tin quyền");
        }

        setName(data.data.name || "");
        setDescription(data.data.description || "");
        setSelectedPermissions(
          Array.isArray(data.data.permissions) ? data.data.permissions : []
        );
      } catch (err) {
        alert(err?.message || "Không lấy được thông tin quyền");
        navigate("/admin/role");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRoleDetail();
  }, [id, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Tên nhóm quyền không được để trống";
    if (!description.trim()) {
      newErrors.description = "Mô tả ngắn không được để trống";
    }
    if (selectedPermissions.length === 0) {
      newErrors.permissions = "Vui lòng chọn ít nhất 1 quyền";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const togglePermission = (value, checked) => {
    if (!permissionValues.includes(value)) return;
    setSelectedPermissions((prev) => {
      if (checked) {
        if (prev.includes(value)) return prev;
        return [...prev, value];
      }
      return prev.filter((p) => p !== value);
    });
    setErrors((prev) => ({ ...prev, permissions: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const payload = {
        name: name.trim(),
        description: description.trim(),
        permissions: selectedPermissions,
      };

      const response = await fetch(`${pathAdmin}/admin/roles/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.code === "error") {
        throw new Error(data?.message || "Cập nhật quyền thất bại!");
      }

      alert("Cập nhật thành công!")
    } catch (err) {
      alert(err?.message || "Cập nhật quyền thất bại!");
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
        Cập nhật nhóm quyền
      </div>

      <div className="mb-[30px] grid sm:grid-cols-1 grid-cols-1 gap-y-[20px] bg-[white] sm:py-[30px] py-[20px] sm:px-[40px] px-[20px] border border-gray-300 rounded-[15px]">
        <div className="flex flex-col">
          <label className="text-[13px] mb-[5px]">Tên nhóm quyền</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((prev) => ({ ...prev, name: "" }));
            }}
            className={`px-[20px] py-[12px] bg-[#F5F6FA] rounded-[5px] outline-none border ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.name && (
            <span className="text-red-500 text-[11px] mt-[4px]">
              {errors.name}
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-[13px] mb-[5px]">Mô tả ngắn</label>
          <input
            type="text"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors((prev) => ({ ...prev, description: "" }));
            }}
            className={`px-[20px] py-[12px] bg-[#F5F6FA] rounded-[5px] outline-none border ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.description && (
            <span className="text-red-500 text-[11px] mt-[4px]">
              {errors.description}
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-[13px] mb-[5px]">Phân quyền</label>
          <div className="flex flex-col gap-[10px] max-h-[260px] overflow-auto px-[10px] py-[8px] bg-[#F5F6FA] rounded-[8px] border border-gray-300">
            {PERMISSION_LIST.map((item) => (
              <div key={item.value} className="flex items-center gap-[10px]">
                <input
                  type="checkbox"
                  name="permissions"
                  value={item.value}
                  checked={selectedPermissions.includes(item.value)}
                  onChange={(e) =>
                    togglePermission(item.value, e.target.checked)
                  }
                />
                <span className="text-[13px]">{item.lable}</span>
              </div>
            ))}
          </div>
          {errors.permissions && (
            <span className="text-red-500 text-[11px] mt-[6px]">
              {errors.permissions}
            </span>
          )}
        </div>
      </div>

      <div className="mt-[30px] flex flex-col items-center gap-y-[20px]">
        <button
          type="submit"
          disabled={submitting}
          className="sm:w-[270px] w-[200px] hover:bg-second rounded-[10px] sm:text-[20px] text-[16px] text-white bg-pri px-[20px] py-[20px] disabled:opacity-50"
        >
          {submitting ? "Đang cập nhật..." : "Cập nhật"}
        </button>
        <a
          href="/admin/role"
          className="text-pri hover:text-second sm:text-[20px] text-[16px] underline"
        >
          Quay lại danh sách
        </a>
      </div>
    </form>
  );
}
