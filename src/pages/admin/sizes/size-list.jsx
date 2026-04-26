import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { pathAdmin, adminEndpoints, apiCall } from '../../../config/api'

export default function SizeList() {
    const [sizes, setSizes] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingSize, setEditingSize] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        value: '',
        slug: '',
        description: '',
        isActive: true
    })

    const navigate = useNavigate()

    useEffect(() => {
        fetchSizes()
    }, [])

    const fetchSizes = async () => {
        try {
            const data = await apiCall(adminEndpoints.sizes.list)
            setSizes(data?.data || [])
        } catch (error) {
            console.error('Error fetching sizes:', error)
            alert('Không thể tải danh sách kích thước')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        try {
            if (editingSize) {
                const data = await apiCall(adminEndpoints.sizes.update(editingSize._id), {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                })
                setSizes(sizes.map(size => 
                    size._id === editingSize._id ? data.data : size
                ))
                alert('Cập nhật kích thước thành công!')
            } else {
                const data = await apiCall(adminEndpoints.sizes.create, {
                    method: 'POST',
                    body: JSON.stringify(formData)
                })
                setSizes([...sizes, data.data])
                alert('Tạo kích thước thành công!')
            }
            
            resetForm()
            setShowCreateModal(false)
        } catch (error) {
            console.error('Error saving size:', error)
            alert(error.message || 'Không thể lưu kích thước')
        }
    }

    const handleDelete = async (sizeId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa kích thước này?')) {
            return
        }

        try {
            await apiCall(adminEndpoints.sizes.delete(sizeId), {
                method: 'DELETE'
            })
            setSizes(sizes.filter(size => size._id !== sizeId))
            alert('Xóa kích thước thành công!')
        } catch (error) {
            console.error('Error deleting size:', error)
            alert(error.message || 'Không thể xóa kích thước')
        }
    }

    const handleEdit = (size) => {
        setEditingSize(size)
        setFormData({
            name: size.name,
            value: size.value,
            slug: size.slug,
            description: size.description || '',
            isActive: size.isActive
        })
        setShowCreateModal(true)
    }

    const handleToggleActive = async (sizeId, currentStatus) => {
        try {
            const data = await apiCall(adminEndpoints.sizes.update(sizeId), {
                method: 'PUT',
                body: JSON.stringify({ isActive: !currentStatus })
            })
            
            setSizes(sizes.map(size => 
                size._id === sizeId ? data.data : size
            ))
        } catch (error) {
            console.error('Error updating size status:', error)
            alert(error.message || 'Không thể cập nhật trạng thái')
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            value: '',
            slug: '',
            description: '',
            isActive: true
        })
        setEditingSize(null)
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
                <div className="sm:text-[30px] text-[20px] font-[700]">Quản lý Kích thước</div>
                <button
                    onClick={() => {
                        resetForm()
                        setShowCreateModal(true)
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Thêm Kích thước
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
                                Mô tả
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
                        {sizes.map((size) => (
                            <tr key={size._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{size.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {size.value}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {size.slug}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                    {size.description}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleToggleActive(size._id, size.isActive)}
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            size.isActive 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {size.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(size)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(size._id)}
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

            {sizes.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <div className="text-gray-500">Chưa có kích thước nào</div>
                    <button
                        onClick={() => {
                            resetForm()
                            setShowCreateModal(true)
                        }}
                        className="mt-2 text-blue-600 hover:text-blue-900"
                    >
                        Tạo kích thước đầu tiên
                    </button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {editingSize ? 'Chỉnh sửa Kích thước' : 'Tạo Kích thước mới'}
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
                                    placeholder="S, M, L, etc."
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
                                    placeholder="s, m, l, etc."
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
                                    Mô tả
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Mô tả về kích thước..."
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
                                    {editingSize ? 'Cập nhật' : 'Tạo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}