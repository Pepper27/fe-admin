import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { pathAdmin, adminEndpoints, apiCall } from '../../../config/api'

export default function MaterialList() {
    const [materials, setMaterials] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingMaterial, setEditingMaterial] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        value: '',
        slug: '',
        description: '',
        isActive: true
    })

    const navigate = useNavigate()

    useEffect(() => {
        fetchMaterials()
    }, [])

    const fetchMaterials = async () => {
        try {
            const data = await apiCall(adminEndpoints.materials.list)
            setMaterials(data?.data || [])
        } catch (error) {
            console.error('Error fetching materials:', error)
            alert('Không thể tải danh sách chất liệu')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        try {
            if (editingMaterial) {
                const data = await apiCall(adminEndpoints.materials.update(editingMaterial._id), {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                })
                setMaterials(materials.map(material => 
                    material._id === editingMaterial._id ? data.data : material
                ))
                alert('Cập nhật chất liệu thành công!')
            } else {
                const data = await apiCall(adminEndpoints.materials.create, {
                    method: 'POST',
                    body: JSON.stringify(formData)
                })
                setMaterials([...materials, data.data])
                alert('Tạo chất liệu thành công!')
            }
            
            resetForm()
            setShowCreateModal(false)
        } catch (error) {
            console.error('Error saving material:', error)
            alert(error.message || 'Không thể lưu chất liệu')
        }
    }

    const handleDelete = async (materialId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa chất liệu này?')) {
            return
        }

        try {
            await apiCall(adminEndpoints.materials.delete(materialId), {
                method: 'DELETE'
            })
            setMaterials(materials.filter(material => material._id !== materialId))
            alert('Xóa chất liệu thành công!')
        } catch (error) {
            console.error('Error deleting material:', error)
            alert(error.message || 'Không thể xóa chất liệu')
        }
    }

    const handleEdit = (material) => {
        setEditingMaterial(material)
        setFormData({
            name: material.name,
            value: material.value,
            slug: material.slug,
            description: material.description || '',
            isActive: material.isActive
        })
        setShowCreateModal(true)
    }

    const handleToggleActive = async (materialId, currentStatus) => {
        try {
            const data = await apiCall(adminEndpoints.materials.update(materialId), {
                method: 'PUT',
                body: JSON.stringify({ isActive: !currentStatus })
            })
            
            setMaterials(materials.map(material => 
                material._id === materialId ? data.data : material
            ))
        } catch (error) {
            console.error('Error updating material status:', error)
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
        setEditingMaterial(null)
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
                <div className="sm:text-[30px] text-[20px] font-[700]">Quản lý Chất liệu</div>
                <button
                    onClick={() => {
                        resetForm()
                        setShowCreateModal(true)
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Thêm Chất liệu
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
                        {materials.map((material) => (
                            <tr key={material._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{material.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {material.value}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {material.slug}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                    {material.description}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleToggleActive(material._id, material.isActive)}
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            material.isActive 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {material.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(material)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(material._id)}
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

            {materials.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <div className="text-gray-500">Chưa có chất liệu nào</div>
                    <button
                        onClick={() => {
                            resetForm()
                            setShowCreateModal(true)
                        }}
                        className="mt-2 text-blue-600 hover:text-blue-900"
                    >
                        Tạo chất liệu đầu tiên
                    </button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {editingMaterial ? 'Chỉnh sửa Chất liệu' : 'Tạo Chất liệu mới'}
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
                                    placeholder="Vàng 14K, Bạc, Da, etc."
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
                                    placeholder="vang-14k, bac, da, etc."
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
                                    placeholder="Mô tả về chất liệu..."
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
                                    {editingMaterial ? 'Cập nhật' : 'Tạo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}