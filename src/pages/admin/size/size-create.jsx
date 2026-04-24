import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { pathAdmin } from "../../../config/api";

export default function SizeCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    unit: 'cm',
    description: '',
    sortOrder: 0,
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(`${pathAdmin}/admin/sizes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        credentials: "include",
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.code === 'success') {
        navigate('/admin/size');
      } else {
        setError(data.message || 'Tạo size thất bại');
      }
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
      <div className="sm:text-[30px] text-[20px] font-[700] mb-[30px]">Tạo kích thước mới</div>
      
      <div className="bg-white rounded-[10px] p-[30px] border border-gray-300">
        {error && (
          <div className="mb-[20px] p-[15px] bg-red-100 text-red-700 rounded-[10px]">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
            <div>
              <label className="block text-[14px] font-[600] mb-[5px]">Tên kích thước *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-[12px] border border-gray-300 rounded-[8px] text-[14px]"
                placeholder="Ví dụ: Small"
              />
            </div>
            
            <div>
              <label className="block text-[14px] font-[600] mb-[5px]">Giá trị kích thước *</label>
              <input
                type="text"
                name="value"
                value={formData.value}
                onChange={handleChange}
                required
                className="w-full p-[12px] border border-gray-300 rounded-[8px] text-[14px]"
                placeholder="Ví dụ: S"
              />
            </div>
            
            <div>
              <label className="block text-[14px] font-[600] mb-[5px]">Đơn vị</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full p-[12px] border border-gray-300 rounded-[8px] text-[14px]"
              >
                <option value="cm">cm</option>
                <option value="mm">mm</option>
                <option value="inch">inch</option>
                <option value="size">size</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[14px] font-[600] mb-[5px]">Thứ tự sắp xếp</label>
              <input
                type="number"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleChange}
                className="w-full p-[12px] border border-gray-300 rounded-[8px] text-[14px]"
                min="0"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[14px] font-[600] mb-[5px]">Mô tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-[12px] border border-gray-300 rounded-[8px] text-[14px] h-[100px]"
                placeholder="Mô tả về kích thước này"
              ></textarea>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
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
              disabled={loading}
              className="bg-pri text-white px-[25px] py-[15px] rounded-[8px] text-[14px] hover:bg-second disabled:opacity-50"
            >
              {loading ? 'Đang tạo...' : 'Tạo kích thước'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/size')}
              className="bg-gray-500 text-white px-[25px] py-[15px] rounded-[8px] text-[14px] hover:bg-gray-600"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}