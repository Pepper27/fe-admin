import { useEffect, useState } from 'react'
import React from "react";
import { FilePond, registerPlugin } from 'react-filepond'
import 'filepond/dist/filepond.min.css'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import { pathAdmin } from "../../../config/api"
import { useNavigate } from "react-router-dom"
import { Editor } from "@tinymce/tinymce-react"
registerPlugin(FilePondPluginImagePreview)
export default function ProductCreate() {
const [name,setName] = useState("")
const [desc,setDesc] = useState("")
const [categoryId, setCategoryId] = useState(""); 
const [arrayCategory, setArrayCategory] = useState([]);  
const [collections, setCollections] = useState([]);
const [selectedCollections, setSelectedCollections] = useState([]);
const navigate = useNavigate()
const materialOptions = [
  { name: "Vàng", color: "#FFD700" },
    { name: "Vàng hồng", color: "linear-gradient(45deg, #FFD700, #E6B8AF)" },
  { name: "Bạc", color: "#C0C0C0" },
]

const [materials, setMaterials] = useState([])
const [openMaterial, setOpenMaterial] = useState(true)
const toggleMaterial = (name) => {
    if (materials.includes(name)) {
        setMaterials(materials.filter(m => m !== name))
    } else {
        setMaterials([...materials, name])
    }
}
const colorOptions = [
  { name: "Đen", code: "#000000" },
  { name: "Không màu", code: "#FFFFFF", border: true },
  { name: "Vàng", code: "#FFFF00" },
  { name: "Hồng", code: "#FF007F" },
  { name: "Nâu", code: "#A52A2A" },
  { name: "Tím", code: "#800080" },
  { name: "Xanh", code: "#007BFF" },
  { name: "Bạc", code: "#C0C0C0" },
  { name: "Xanh lá cây", code: "#008000" },
  { name: "Đỏ", code: "#B22222" },
  { name: "Nhiều màu", gradient: "linear-gradient(45deg, black, yellow, green, purple)" },
];

const [colors, setColors] = useState([])
const toggleColor = (colorName) => {
    if (colors.includes(colorName)) {
        setColors(colors.filter(c => c !== colorName))
    } else {
        setColors([...colors, colorName])
    }
}
const [openColor, setOpenColor] = useState(true)
const sizeOptions = [16, 17, 18, 19, 20, 21, 22]
// RING SIZE OPTIONS - NHẬN SIZE: 48, 50, 52, 54, 56, 58
const ringSizeOptions = [48, 50, 52, 54, 56, 58]

const [sizes, setSizes] = useState([])
const [openSize, setOpenSize] = useState(true)
const toggleSize = (size) => {
    if (sizes.includes(size)) {
        setSizes(sizes.filter(s => s !== size))
    } else {
        setSizes([...sizes, size])
    }
}
const [categoryType, setCategoryType] = useState("")

const generateVariants = () => {

    if (materials.length === 0) {
        alert("Thiếu nguyên liệu");
        return;
    }

    if (categoryType === "charm") {
        if (colors.length === 0) {
            alert("Charm phải có màu");
            return;
        }
    } else if (categoryType === "ring") {
        if (colors.length === 0) {
            alert("Nhẫn phải có màu");
            return;
        }
        if (sizes.length === 0) {
            alert("Nhẫn phải có size");
            return;
        }
    } else {
        if (sizes.length === 0) {
            alert("Thiếu size");
            return;
        }
    }

    let result = [];

    const findOldVariant = (m, c, s) => {
        return variants.find(v =>
            v.material === m &&
            v.size === s &&
            ((categoryType === "charm" || categoryType === "ring") ? v.color === c : true)
        );
    };

    if (categoryType === "charm") {
        materials.forEach(m => {
            colors.forEach(c => {
                const old = findOldVariant(m, c, null);
                result.push({
                    material: m,
                    color: c,
                    price: old?.price || 0,
                    quantity: old?.quantity || 0,
                    image: old?.image || []
                });
            });
        });
    } else if (categoryType === "ring") {
        materials.forEach(m => {
            colors.forEach(c => {
                sizes.forEach(s => {
                    const old = findOldVariant(m, c, s);
                    result.push({
                        material: m,
                        color: c,
                        size: s,
                        price: old?.price || 0,
                        quantity: old?.quantity || 0,
                        image: old?.image || []
                    });
                });
            });
        });
    } else {
        materials.forEach(m => {
            sizes.forEach(s => {
                const old = findOldVariant(m, null, s);

                result.push({
                    material: m,
                    size: s,
                    price: old?.price || 0,
                    quantity: old?.quantity || 0,
                    image: old?.image || []
                });
            });
        });
    }

    setVariants(result);
};
const updateVariant = (index, field, value) => {
    const newVariants = [...variants]
    newVariants[index][field] = value
    setVariants(newVariants)
}

const [variants,setVariants] = useState([])
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

useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${pathAdmin}/admin/collections`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
        },
        credentials: "include",
    })
    .then(res => res.json())
    .then(data => {
        if (data?.code === "error") {
            throw new Error(data.message || "Unauthorized");
        }
        setCollections(data?.data || [])
    })
    .catch((err) => {
        console.error("Fetch collections failed", err);
        setCollections([]);
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
const findCategoryById = (categories, id) => {
    for (let c of categories) {
        if (c.id === id) return c
        if (c.children) {
            const found = findCategoryById(c.children, id)
            if (found) return found
        }
    }
}
const [errors, setErrors] = useState({});
const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
        newErrors.name = "Tên danh mục không được để trống";
    }
    if (!desc.trim()) {
        newErrors.desc = "Mô tả không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

const handlerSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const token = localStorage.getItem("token");
    const formData = new FormData();
    // Lọc lại các thuộc tính thực sự còn tồn tại sau khi user đã xóa bớt variant
    const actualMaterials = [...new Set(variants.map(v => v.material).filter(Boolean))];
    const actualColors = [...new Set(variants.map(v => v.color).filter(Boolean))];
    const actualSizes = [...new Set(variants.map(v => v.size).filter(Boolean))];
    formData.append("name", name);
    formData.append("description", desc);
    formData.append("category", categoryId);
    formData.append("collections", JSON.stringify(selectedCollections));
   formData.append("options", JSON.stringify({
        materials: actualMaterials,
        colors: actualColors,
        sizes: actualSizes
    }));
    formData.append("variants", JSON.stringify(
        variants.map(v => ({
            material: v.material,
            color: v.color,
            size: v.size,
            price: v.price,
            quantity: v.quantity
        }))
    ));
    variants.forEach((v, i) => {
        if (v.image && v.image.length > 0) {
            v.image.forEach(file => {
                formData.append(`images-${i}`, file)
            });
        }
    });
    console.log(variants)
    fetch(`${pathAdmin}/admin/products`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
        body: formData
    })
    .then(res => res.json())
    .then(() => {
        navigate("/admin/product");
    });
};
return(
    <>
        <form onSubmit={handlerSubmit} className="xl:w-[calc(100%-240px)] lg:w-[calc(100%-220px)] w-full pt-[100px] lg:ml-[240px] l-0 flex flex-col mx-[16px] sm:px-[30px] px-[10px] sm:pr-[55px] pr-[30px]">
            <div className="sm:text-[30px] text-[20px] font-[700] mb-[30px]">Tạo sản phẩm</div>
            <div className="mb-[30px] grid sm:grid-cols-2 grid-cols-1 gap-y-[20px] gap-x-[30px] bg-[white] sm:py-[30px] py-[20px] sm:px-[40px] px-[20px] border border-gray-300 rounded-[15px]">
                <div className="flex flex-col">
                    <label className="text-[13px] mb-[5px]">Tên sản phẩm</label>
                    <input
                        value={name}
                        onChange={(e) => {
                        setName(e.target.value);
                        setErrors((prev) => ({ ...prev, name: "" }));
                        }}
                        className={`px-[20px] py-[12px] bg-[#F5F6FA] rounded-[5px] outline-none border
                        ${errors.name ? "border-red-500" : "border-gray-300"}`}
                    />

                    {errors.name && (
                        <span className="text-red-500 text-[11px] mt-[4px]">
                        {errors.name}
                        </span>
                    )}
                    </div>

                <div className="flex flex-col">
                    <label className="text-[13px] mb-[5px]">Danh mục</label>
                    <select 
                    value={categoryId}
                    onChange={(e) => {
                        setCategoryId(e.target.value)

                        const selected = findCategoryById(arrayCategory, e.target.value)

                        if(selected?.name?.toLowerCase().includes("charm")){
                            setCategoryType("charm")
                        } else if(selected?.name?.toLowerCase().includes("nhẫn")){
                            setCategoryType("ring")
                        } else {
                            setCategoryType("normal")
                        }
                        setVariants([])
                        setMaterials([])
                        setSizes([])
                        setColors([])
                    }}
                    className="sm:text-[14px] text-[12px]  px-[20px] py-[12px] bg-[#F5F6FA] rounded-[5px] outline-none border border-gray-300 " >
                        <option value=""> -- Chọn danh mục -- </option>
                        {renderOptions(arrayCategory)}
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-[13px] mb-[5px]">Bộ sưu tập</label>
                    <select
                        multiple
                        value={selectedCollections}
                        onChange={(e) => {
                            const values = Array.from(e.target.selectedOptions).map((o) => o.value);
                            setSelectedCollections(values);
                        }}
                        className="sm:text-[14px] text-[12px] px-[20px] py-[12px] bg-[#F5F6FA] rounded-[5px] outline-none border border-gray-300"
                    >
                        {collections.map((c) => (
                            <option key={c._id} value={c._id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <div className="text-[11px] text-gray-500 mt-[6px]">Giữ Ctrl/Cmd để chọn nhiều</div>
                </div>
                {categoryType!=="" &&(
                    <>
                        <div className="flex flex-col sm:col-span-2 col-span-1">
                            <div 
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => setOpenMaterial(!openMaterial)}
                            >
                                <label className="text-[13px]">Chất liệu</label>
                                <span>{openMaterial ? "-" : "+"}</span>
                            </div>

                            {openMaterial && (
                                <div className="flex flex-wrap gap-3 mt-3">

                                {materialOptions.map((m) => (
                                    <button
                                        type="button"
                                        key={m.name}
                                        onClick={() => toggleMaterial(m.name)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded border
                                        ${materials.includes(m.name) ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
                                    >
                                    <span
                                        className="w-4 h-4 rounded-full"
                                        style={{
                                        background: m.color
                                        }}
                                    />

                                    <span className="text-sm">{m.name}</span>
                                    </button>
                                ))}

                                </div>
                            )}

                        </div>
                        {(categoryType === "charm" || categoryType === "ring") && (
                            <div className="flex flex-col sm:col-span-2 col-span-1">

                            <div className="flex justify-between items-center cursor-pointer"
                                onClick={() => setOpenColor(!openColor)}>
                                <label className="text-[13px]">Màu sắc</label>
                                <span>{openColor ? "-" : "+"}</span>
                            </div>

                            {openColor && (
                                <div className="flex flex-wrap gap-3 mt-3">

                                {colorOptions.map((color) => (
                                    <button
                                    type="button"
                                    key={color.name}
                                    onClick={() => toggleColor(color.name)}
                                    className="flex items-center gap-2"
                                    >
                                    <span
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center 
                                        ${colors.includes(color.name) ? "ring-2 ring-blue-500" : ""}`}
                                        style={{
                                        background: color.gradient ? color.gradient : color.code,
                                        border: color.border ? "1px solid #ccc" : "none"
                                        }}
                                    />
                                    <span className="text-sm">{color.name}</span>
                                    </button>
                                ))}

                                </div>
                            )}

                            </div>
                        )}
                        {categoryType !== "charm" && (
                        <div className="flex flex-col sm:col-span-2 col-span-1">
                                <div 
                                    className="flex justify-between items-center cursor-pointer"
                                    onClick={() => setOpenSize(!openSize)}
                                >
                                    <label className="text-[13px]">Size</label>
                                    <span>{openSize ? "-" : "+"}</span>
                                </div>

                                {openSize && (
                                    <div className="flex flex-wrap gap-3 mt-3">

                                    {(categoryType === "ring" ? ringSizeOptions : sizeOptions).map((s) => (
                                        <button
                                        type="button"
                                        key={s}
                                        onClick={() => toggleSize(s)}
                                        className={`px-4 py-2 rounded border text-sm
                                        ${sizes.includes(s)
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-300"}`}
                                        >
                                        {s}
                                        </button>
                                    ))}

                                    </div>
                                )}

                                </div>
                        )}
                        <button type="button" onClick={generateVariants}  className="bg-blue-500 text-white px-4 py-2 sm:col-span-2 col-span-1 w-[200px]">
                            Tạo biến thể
                        </button>
                   </>
                )}
                
                {variants.length > 0 && (
                    <table className="w-full mt-5 border sm:col-span-2 col-span-1">
                        <thead>
                            <tr>
                                <th className='w-[100px]'>Chất liệu</th>
                                {(categoryType === "charm" || categoryType === "ring") && (
                                    <th className='w-[100px]'> Màu sắc</th>
                                )}
                                {categoryType !== "charm" && (
                                    <th className='w-[100px]'>Size</th>
                                )}
                                <th className='w-[100px]'>Giá</th>
                                <th className='w-[100px]'>Số lượng</th>
                                <th className='w-[300px]'>Ảnh</th>
                                <th className='w-[100px]'>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
{variants.map((v,i)=>(
                                <tr key={i} className='text-center'>
                                    <td>{v.material}</td>
                                    {(categoryType === "charm" || categoryType === "ring") &&(
                                        <td>{v.color}</td>
                                    )}
                                    {categoryType !== "charm" && (
                                        <td>{v.size}</td>
                                    )}
                                    <td>
                                        <input 
                                            type='number'
                                            className='text-center focus:outline-none'
                                            value={v.price}
                                            onChange={e=>updateVariant(i,"price",e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            type='number'
                                            className='text-center focus:outline-none'
                                            value={v.quantity}
                                            onChange={e=>updateVariant(i,"quantity",e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <div className="variant-upload">
                                           <FilePond
                                                files={
                                                    v.image
                                                        ? v.image.map(file => ({
                                                            source: file,
                                                            options: { type: "local" }
                                                        }))
                                                        : []
                                                }
                                                onupdatefiles={(fileItems) => {
                                                    const files = fileItems.map(f => f.file) // 👈 lấy ALL file
                                                    updateVariant(i, "image", files)
                                                }}
                                                allowMultiple={true}
                                                maxFiles={5}
                                                name={`images-${i}`}
                                                labelIdle="Kéo thả hoặc chọn ảnh"
                                            />
                     
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            onClick={()=>{
                                                const newVariants = variants.filter((_,index)=> index !== i)
                                                setVariants(newVariants)
                                            }}
                                            className="text-red-500"
                                        >
                                            Xoá
                                        </button>
                                    </td>
                                </tr>
                             ))}
                        </tbody>
                    </table>
                )}
    
                <div className="flex flex-col sm:col-span-2 col-span-1">
                    <label htmlFor='description' className="text-[13px] mb-[5px]">Mô tả</label>
                    <div className={`${errors.desc ? "border border-red-500 rounded-[5px]" : ""}`}>
                    <Editor
                        apiKey="4za2bx0zr5zze6b3ux1l4un4bnkypmn6nr1vlsmnhpy3iqrm"
                        init={{
                            plugins: [
                            'anchor', 'autolink', 'charmap', 'codesample', 'emoticons',
                            'link', 'lists', 'media', 'searchreplace', 'table',
                            'visualblocks', 'wordcount'
                            ],
                            toolbar:
                            'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | ' +
                            'link media table | align lineheight | numlist bullist indent outdent | ' +
                            'emoticons charmap | removeformat',
                        }}
                        initialValue=""
                        onEditorChange={(content) => {
                            setDesc(content); 
                            setErrors((prev) => ({ ...prev, desc: "" }));
                        }}
                        value={desc} 
                        id="desc"
                    />
                    {errors.desc && (
                        <span className="text-red-500 text-[11px] mt-[4px]">
                        {errors.desc}
                        </span>
                    )}
                    </div>
                    <div className="mt-[30px] flex flex-col items-center gap-y-[20px]">
                        <button className="sm:w-[270px] w-[200px] hover:bg-second rounded-[10px] sm:text-[20px] text-[16px] text-white bg-pri px-[20px] py-[20px]">Tạo sản phẩm</button>
                        <a href="/admin/category" className="text-pri hover:text-second sm:text-[20px] text-[16px] underline">Quay lại danh sách</a>
                    </div>
                </div>    
            </div>
        </form>
    </>
)
}
