import { useEffect, useMemo, useState } from "react";
import { fetchAccountsAndRoles, deleteAccount } from '../../../../services/account.service'
import { CiSearch } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import FilterBar from '../../../../../src/components/FilterBar'
import useFilter from '../../../../../src/hooks/useFilter'
import { toast } from "react-toastify";

export default function SettingAccountList() {
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const { values: filterValues, handleChange: onFilterChange, reset: resetFilters } = useFilter({
    defaultValues: { statusFilter: '', roleFilter: '' },
    debounce: 200,
  });

  const statusFilter = filterValues.statusFilter;
  const roleFilter = filterValues.roleFilter;

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchAll = async () => {
      try {
        setLoading(true);
        const { accountData, roleData } = await fetchAccountsAndRoles();
        setAccounts(Array.isArray(accountData?.data) ? accountData.data : []);
        setRoles(Array.isArray(roleData?.data) ? roleData.data : []);
      } catch (error) {
        toast.error("Không tải được danh sách tài khoản!");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const roleMap = useMemo(() => {
    const map = {};
    roles.forEach((role) => {
      map[role._id] = role.name;
    });
    return map;
  }, [roles]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((item) => {
      const text = `${item.fullName || ""} ${item.email || ""} ${item.phone || ""}`.toLowerCase();
      const byKeyword = keyword.trim()
        ? text.includes(keyword.trim().toLowerCase())
        : true;
      const byStatus = statusFilter ? item.status === statusFilter : true;
      const byRole = roleFilter ? item.role === roleFilter : true;
      return byKeyword && byStatus && byRole;
    });
  }, [accounts, keyword, statusFilter, roleFilter]);

  const handleDelete = async (item) => {
    const ok = window.confirm(`Bạn có chắc muốn xóa tài khoản "${item.fullName || ""}"?`);
    if (!ok) return;

    try {
      const resp = await deleteAccount(item._id);
      const { ok, data } = resp;
      if (!ok || data?.code === 'error') throw new Error(data?.message || 'Xóa thất bại!');
      setAccounts((prev) => prev.filter((x) => x._id !== item._id));
      toast.success("Xoá tài khoản nội bộ thành công!");
    } catch (error) {
      toast.error(error?.message || "Xóa thất bại!");
    }
  };

  return (
    <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
      <div className="sm:text-[30px] text-[20px] font-[700] mb-[30px]">
        Tài khoản nội bộ
      </div>

      <div className="flex flex-wrap gap-[12px] mb-[20px]">
        <div className="w-full">
          <FilterBar
            fields={[
              { name: 'statusFilter', type: 'select', options: [{ label: 'Trạng thái', value: '' }, { label: 'Khởi tạo', value: 'initial' }, { label: 'Hoạt động', value: 'active' }] },
              { name: 'roleFilter', type: 'select', options: [{ label: 'Nhóm quyền', value: '' }, ...roles.map(r => ({ label: r.name, value: r._id }))] },
              { name: 'keyword', type: 'custom', render: (v, onChange) => (
                  <div className="flex items-center bg-white border border-gray-300 rounded-[10px] px-[14px] py-[12px] w-[260px]">
                    <CiSearch />
                    <input value={keyword} onChange={(e)=>setKeyword(e.target.value)} placeholder="Tìm kiếm" className="ml-[8px] text-[14px] outline-none w-full" />
                  </div>
                ) },
            ]}
            values={{ ...filterValues, keyword }}
            onChange={(v) => { onFilterChange(v); }}
            onReset={() => { resetFilters(); setKeyword(''); }}
          card={true}
          />
        </div>

        <a
          href="/admin/setting/account/create"
          className="text-white text-[14px] hover:bg-second bg-pri py-[12px] px-[20px] rounded-[10px] border border-gray-300"
        >
          + Tạo mới
        </a>
      </div>

      <div className="bg-white rounded-[14px] border border-gray-300 overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-[#e5e1e1]">
            <tr>
              <td className="p-[14px] text-[14px] font-[600]">Họ tên</td>
              <td className="p-[14px] text-[14px] font-[600]">Email</td>
              <td className="p-[14px] text-[14px] font-[600]">SĐT</td>
              <td className="p-[14px] text-[14px] font-[600]">Nhóm quyền</td>
              <td className="p-[14px] text-[14px] font-[600]">Chức vụ</td>
              <td className="p-[14px] text-[14px] font-[600]">Trạng thái</td>
              <td className="p-[14px] text-[14px] font-[600]">Hành động</td>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-[20px]" colSpan="7">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredAccounts.length === 0 ? (
              <tr>
                <td className="p-[20px] text-center text-gray-500" colSpan="7">
                  Không có tài khoản nội bộ nào thỏa mãn!
                </td>
              </tr>
            ) : (
              filteredAccounts.map((item) => (
                <tr key={item._id} className="border-t border-gray-100">
                  <td className="p-[14px] text-[14px]">{item.fullName || ""}</td>
                  <td className="p-[14px] text-[14px]">{item.email || ""}</td>
                  <td className="p-[14px] text-[14px]">{item.phone || ""}</td>
                  <td className="p-[14px] text-[14px]">{roleMap[item.role] || ""}</td>
                  <td className="p-[14px] text-[14px]">{item.positionCompany || ""}</td>
                  <td className="p-[14px] text-[14px]">
                    {item.status === "active" ? "Hoạt động" : "Khởi tạo"}
                  </td>
                  <td className="p-[14px] text-[14px]">
                    <div className="flex">
                      <a
                        href={`/admin/setting/account/update/${item._id}`}
                        className="rounded-l-[10px] text-[14px] p-[12px] bg-white border-y border-l border-gray-300"
                      >
                        <FaRegEdit className="text-[16px]" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="rounded-r-[10px] text-[14px] p-[12px] bg-white border border-gray-300"
                      >
                        <FaRegTrashCan className="text-[16px] text-[red]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
