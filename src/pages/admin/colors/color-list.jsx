import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { pathAdmin, adminEndpoints, apiCall } from '../../../config/api'

export default function ColorList() {
    const [colors, setColors] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingColor, setEditingColor] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        value: '',
        slug: '',
        code: '',
        description: '',
        isActive: true
    })

    const navigate = useNavigate()

    useEffect(() => {
        fetchColors()
    }, [])

    const fetchColors = async () => {
        try {
            const data = await apiCall(adminEndpoints.colors.list)
            setColors(data?.data || [])
        } catch (error) {
            console.error('Error fetching colors:', error)
            alert('Không thể tải danh sách màu sắc')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        try {
            const payload = {
                name: formData.name,
                value: formData.value,
                slug: formData.slug,
                code: formData.code,
                description: formData.description,
                isActive: formData.isActive
            }

            if (editingColor) {
                const data = await apiCall(adminEndpoints.colors.update(editingColor._id), {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                })
                setColors(colors.map(color => 
                    color._id === editingColor._id ? data.data : color
                ))
                alert('Cập nhật màu sắc thành công!')
            } else {
                const data = await apiCall(adminEndpoints.colors.create, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                })
                setColors([...colors, data.data])
                alert('Tạo màu sắc thành công!')
            }
            
            resetForm()
            setShowCreateModal(false)
        } catch (error) {
            console.error('Error saving color:', error)
            alert(error.message || 'Không thể lưu màu sắc')
        }
    }

    const handleDelete = async (colorId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa màu sắc này?')) {
            return
        }

        try {
            await apiCall(adminEndpoints.colors.delete(colorId), {
                method: 'DELETE'
            })
            setColors(colors.filter(color => color._id !== colorId))
            alert('Xóa màu sắc thành công!')
        } catch (error) {
            console.error('Error deleting color:', error)
            alert(error.message || 'Không thể xóa màu sắc')
        }
    }

    const handleEdit = (color) => {
        setEditingColor(color)
        setFormData({
            name: color.name,
            value: color.value,
            slug: color.slug,
            code: color.code || '',
            description: color.description || '',
            isActive: color.isActive
        })
        setShowCreateModal(true)
    }

    const handleToggleActive = async (colorId, currentStatus) => {
        try {
            const data = await apiCall(adminEndpoints.colors.update(colorId), {
                method: 'PUT',
                body: JSON.stringify({ isActive: !currentStatus })
            })
            
            setColors(colors.map(color => 
                color._id === colorId ? data.data : color
            ))
        } catch (error) {
            console.error('Error updating color status:', error)
            alert(error.message || 'Không thể cập nhật trạng thái')
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            value: '',
            slug: '',
            code: '',
            description: '',
            isActive: true
        })
        setEditingColor(null)
    }

    if (loading) {
        return (
            <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
                <div className="text-center py-8">
                    <div className="text-lg">Đang tải...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
            <div className="flex justify-between items-center mb-[30px]">
                <div className="sm:text-[30px] text-[20px] font-[700]">Quản lý Màu sắc</div>
                <button
                    onClick={() => {
                        resetForm()
                        setShowCreateModal(true)
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Thêm Màu sắc
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tên
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Giá trị
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Slug
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Mã màu
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trạng thái
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {colors.map((color) => (
                            <tr key={color._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{color.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {color.value}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {color.slug}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {color.code && (
                                        <div className="flex items-center">
                                            <div
                                                className="w-6 h-6 rounded-full border border-gray-300 mr-2"
                                                style={{ backgroundColor: color.code }}
                                            />
                                            <span className="text-sm">{color.code}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleToggleActive(color._id, color.isActive)}
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            color.isActive 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {color.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(color)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(color._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {colors.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <div className="text-gray-500">Chưa có màu sắc nào</div>
                    <button
                        onClick={() => {
                            resetForm()
                            setShowCreateModal(true)
                        }}
                        className="mt-2 text-blue-600 hover:text-blue-900"
                    >
                        Tạo màu sắc đầu tiên
                    </button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {editingColor ? 'Chỉnh sửa Màu sắc' : 'Tạo Màu sắc mới'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false)
                                    resetForm()
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Đỏ, Xanh, Vàng, etc."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá trị <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.value}
                                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="do, xanh, vang, etc."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Auto-generated"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mã màu
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="#FF0000, #000000, etc."
                                    />
                                    {formData.code && (
                                        <div
                                            className="w-10 h-10 rounded border border-gray-300"
                                            style={{ backgroundColor: formData.code }}
                                        />
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Mô tả về màu sắc..."
                                    rows="3"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                                    Kích hoạt
                                </label>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false)
                                        resetForm()
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    {editingColor ? 'Cập nhật' : 'Tạo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}