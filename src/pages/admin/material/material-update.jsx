import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminEndpoints, apiCall } from '../../../config/api'

export default function MaterialUpdate() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', description: '', sortOrder: 0, isActive: true })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const res = await apiCall(adminEndpoints.materials.update(id))
        setForm(res.data || {})
      } catch (err) {
        console.error('Fetch material failed', err)
        alert(err.message || 'Không thể tải chất liệu')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await apiCall(adminEndpoints.materials.update(id), {
        method: 'PATCH',
        body: JSON.stringify(form)
      })
      alert('Cập nhật thành công')
      navigate('/admin/material')
    } catch (err) {
      console.error('Update failed', err)
      alert(err.message || 'Không thể cập nhật chất liệu')
    }
  }

  if (loading) return <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]"><div className="text-center py-8">Đang tải...</div></div>

  return (
    <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
      <div className="sm:text-[30px] text-[20px] font-[700] mb-[30px]">Chỉnh sửa chất liệu</div>
      <div className="bg-white rounded-[10px] p-[30px] border border-gray-300">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
            <div>
              <label className="block text-[14px] font-[600] mb-[5px]">Tên chất liệu *</label>
              <input
                type="text"
                name="name"
                value={form.name || ''}
                onChange={handleChange}
                required
                className="w-full p-[12px] border border-gray-300 rounded-[8px] text-[14px]"
                placeholder="Ví dụ: Vàng"
              />
            </div>

            <div>
              <label className="block text-[14px] font-[600] mb-[5px]">Mô tả</label>
              <input
                type="text"
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                className="w-full p-[12px] border border-gray-300 rounded-[8px] text-[14px]"
                placeholder="Mô tả ngắn"
              />
            </div>

            <div>
              <label className="block text-[14px] font-[600] mb-[5px]">Thứ tự sắp xếp</label>
              <input
                type="number"
                name="sortOrder"
                value={form.sortOrder || 0}
                onChange={handleChange}
                className="w-full p-[12px] border border-gray-300 rounded-[8px] text-[14px]"
                min="0"
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
            <button
              type="submit"
              className="bg-pri text-white px-[25px] py-[15px] rounded-[8px] text-[14px] hover:bg-second"
            >
              Cập nhật
            </button>
            <button type="button" onClick={() => navigate('/admin/material')} className="bg-gray-500 text-white px-[25px] py-[15px] rounded-[8px] text-[14px] hover:bg-gray-600">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  )
}
