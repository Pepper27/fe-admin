import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminEndpoints, apiCall } from '../../../config/api'

export default function ColorUpdate() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', codeColor: '', codeHex: '', sortOrder: 0, isActive: true })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const res = await apiCall(adminEndpoints.colors.update(id))
        setForm(res.data || {})
      } catch (err) {
        console.error('Fetch color failed', err)
        alert(err.message || 'Không thể tải màu')
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
      await apiCall(adminEndpoints.colors.update(id), {
        method: 'PATCH',
        body: JSON.stringify(form)
      })
      alert('Cập nhật thành công')
      navigate('/admin/color')
    } catch (err) {
      console.error('Update failed', err)
      alert(err.message || 'Không thể cập nhật màu')
    }
  }

  if (loading) return <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]"><div className="text-center py-8">Đang tải...</div></div>

  return (
    <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
      <div className="sm:text-[30px] text-[20px] font-[700] mb-[30px]">Chỉnh sửa màu sắc</div>
      <div className="bg-white rounded-[10px] p-[30px] border border-gray-300">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
            <div>
              <label className="block text-[14px] font-[600] mb-[5px]">Tên màu sắc *</label>
              <input
                type="text"
                name="name"
                value={form.name || ''}
                onChange={handleChange}
                required
                className="w-full p-[12px] border border-gray-300 rounded-[8px] text-[14px]"
                placeholder="Ví dụ: Đỏ"
              />
            </div>

            <div>
              <label className="block text-[14px] font-[600] mb-[5px]">Mã màu *</label>
              <input
                type="text"
                name="code"
                value={form.codeColor || ''}
                onChange={handleChange}
                required
                className="w-full p-[12px] border border-gray-300 rounded-[8px] text-[14px]"
                placeholder="Ví dụ: RED"
              />
            </div>

            <div>
              <label className="block text-[14px] font-[600] mb-[5px]">Mã hex</label>
              <div className="flex items-center gap-[10px]">
                <input
                  type="color"
                  value={form.codeHex || '#000000'}
                  onChange={(e) => setForm(prev => ({ ...prev, codeHex: e.target.value, codeColor: e.target.value.replace('#', '') }))}
                  className="w-[50px] h-[50px] border border-gray-300 rounded-[8px]"
                />
                <input
                  type="text"
                  name="hex"
                  value={form.codeHex || ''}
                  onChange={handleChange}
                  className="flex-1 p-[12px] border border-gray-300 rounded-[8px] text-[14px]"
                  placeholder="#FF0000"
                />
              </div>
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
            <button type="button" onClick={() => navigate('/admin/color')} className="bg-gray-500 text-white px-[25px] py-[15px] rounded-[8px] text-[14px] hover:bg-gray-600">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  )
}
