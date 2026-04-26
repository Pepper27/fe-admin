import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminEndpoints, apiCall } from '../../../config/api'
import { pathAdmin } from "../../../config/api";
export default function SizeUpdate() {
  const { id } = useParams()
  const [arrayCategory, setArrayCategory] = useState([]);  
  const [categoryId, setCategoryId] = useState(""); 
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', value: '', category: '', description: '', isActive: true })
  const [loading, setLoading] = useState(true)
  useEffect(()=>{
    const token = localStorage.getItem("token");
    fetch(`${pathAdmin}/admin/categories/parent`,{
        method:"GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
        },
        credentials:"include"
    })
    .then(res => {
        if (res.status === 200) {
            return res.json();
        }
    })
    .then(data=>{
        if (data?.code === "error") {
            throw new Error(data.message || "Unauthorized");
        }
        setArrayCategory(data?.data || []) 
    })   
    .catch((err) => {
        console.error("Fetch parent categories failed", err);
        alert(err?.message || "Failed to fetch");
        setArrayCategory([]);
    })
  },[])
  const renderOptions = (categories, level = 0) => {
    return categories.map(item => (
      <React.Fragment key={item.id}>
        <option value={item.id}>
          {"--".repeat(level)} {item.name}
        </option>
  
        {item.children && item.children.length > 0 &&
          renderOptions(item.children, level + 1)
        }
      </React.Fragment>
    ));
  };
  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const res = await apiCall(adminEndpoints.sizes.update(id))
        setForm(res.data || {})
        setCategoryId(res.data.category || "")
      } catch (err) {
        console.error('Fetch size failed', err)
        alert(err.message || 'Không thể tải kích thước')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => 
      ({ ...prev,
        [name]: type === 'checkbox' ? checked : value 
      }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await apiCall(adminEndpoints.sizes.update(id), {
        method: 'PATCH',
        body: JSON.stringify(form)
      })
      console.log(form)
      alert('Cập nhật thành công')
      navigate('/admin/size')
    } catch (err) {
      console.error('Update failed', err)
      alert(err.message || 'Không thể cập nhật kích thước')
    }
  }

  if (loading) return <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]"><div className="text-center py-8">Đang tải...</div></div>

  return (
    <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
      <div className="sm:text-[30px] text-[20px] font-[700] mb-[30px]">Chỉnh sửa kích thước</div>
      <div className="bg-white rounded-[10px] p-[30px] border border-gray-300">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
            <div>
              <label className="block text-[14px] font-[600] mb-[5px]">Tên <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                value={form.name || ''}
                onChange={handleChange}
                required
                className="w-full p-[12px] border border-gray-300 rounded-[8px] text-[14px]"
                placeholder="S, M, L, etc."
              />
            </div>

            <div>
              <label className="block text-[14px] font-[600] mb-[5px]">Giá trị <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="value"
                value={form.value || ''}
                onChange={handleChange}
                required
                className="w-full p-[12px] border border-gray-300 rounded-[8px] text-[14px]"
                placeholder="s, m, l, etc."
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[13px] mb-[5px]">Danh mục áp dụng size</label>
              <select
                value={categoryId}
                onChange={(e) => {
                const value = e.target.value;
                setCategoryId(value)
                setForm(prev => ({
                  ...prev,
                  category: value
                }));
                }}
                className="sm:text-[14px] text-[12px] px-[20px] py-[12px] bg-[#F5F6FA] rounded-[5px] outline-none border border-gray-300"
              >
                <option value=""> -- Chon danh muc -- </option>
                {renderOptions(arrayCategory)}
              </select>
            </div>
            <div>
              <label className="block text-[14px] font-[600] mb-[5px]">Mô tả</label>
              <input
                type="text"
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                className="w-full p-[12px] border border-gray-300 rounded-[8px] text-[14px]"
                placeholder="Mô tả về kích thước..."
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={!!form.isActive}
                  onChange={handleChange}
                  className="mr-[10px]"
                />
                <span className="text-[14px]">Kích hoạt</span>
              </label>
            </div>
          </div>

          <div className="flex gap-[10px] mt-[30px]">
            <button type="submit" className="bg-pri text-white px-[25px] py-[15px] rounded-[8px] text-[14px] hover:bg-second">Cập nhật</button>
            <button type="button" onClick={() => navigate('/admin/size')} className="bg-gray-500 text-white px-[25px] py-[15px] rounded-[8px] text-[14px] hover:bg-gray-600">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  )
}
