import { useParams } from "react-router-dom";
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
export default function CategoryUpdate() {
    const [files, setFiles] = useState([]);
    const [name,setName] = useState("")
    const [position,setPosition] = useState("")
    const [desc,setDesc] = useState("")
    const [categoryId, setCategoryId] = useState(""); 
    const [arrayCategory, setArrayCategory] = useState([]);  
    const navigate = useNavigate();
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
    const params = useParams();
    const id = params.id;

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch(`${pathAdmin}/admin/categories/${id}`,{
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
            },
            credentials: "include"

        })
        .then(res => res.json())
        .then(data => {
            const cate = data.data
            setName(cate.name)
            setPosition(cate.position)
            setDesc(cate.description)
            setCategoryId(cate.parent || "")
        });
    }, [id]);
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
    const [errors, setErrors] = useState({});
    const validate = () => {
        const newErrors = {};
        if (!name.trim()) {
            newErrors.name = "Tên danh mục không được để trống";
        }
        if (!desc.trim()) {
            newErrors.desc = "Mô tả không được để trống";
        }

        if (files.length === 0) {
            newErrors.avatar = "Vui lòng chọn ảnh đại diện";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlerSubmit = (e) => {
        e.preventDefault();
        if(!validate()) return
        const token = localStorage.getItem("token");
        const dataFinal = new FormData();
        dataFinal.append("name", name);
        dataFinal.append("parent", categoryId);
        dataFinal.append("position", position);
        dataFinal.append("desc", desc);
        if (files.length > 0) {
        dataFinal.append("avatar", files[0]);
        }
        fetch(`${pathAdmin}/admin/categories/${id}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
            },
            body: dataFinal,
            credentials: "include"
        })
        .then(res => res.json())
        .then(data => {
            if (data?.code === "success") {
                navigate("/admin/category");
            } else {
                alert(data.message);
            }
        })
    };

    return(
        <>
            <form onSubmit={handlerSubmit} className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
                <div className="sm:text-[30px] text-[20px] font-[700] mb-[30px]">Tạo danh mục</div>
                <div className="mb-[30px] grid sm:grid-cols-2 grid-cols-1 gap-y-[20px] gap-x-[30px] bg-[white] sm:py-[30px] py-[20px] sm:px-[40px] px-[20px] border border-gray-300 rounded-[15px]">
                    <div className="flex flex-col">
                        <label className="text-[13px] mb-[5px]">Tên danh mục</label>
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
                        <label className="text-[13px] mb-[5px]">Danh mục cha</label>
                        <select 
                        value={categoryId}
                        onChange={(e) => {
                            setCategoryId(e.target.value)
                        }}
                        className="sm:text-[14px] text-[12px]  px-[20px] py-[12px] bg-[#F5F6FA] rounded-[5px] outline-none border border-gray-300 " >
                            <option value=""> -- Chọn danh mục -- </option>
                            {renderOptions(arrayCategory)}
                        </select>
                    </div>
                    <div className="flex flex-col sm:col-span-2 col-span-1">
                        <label className="text-[13px] mb-[5px]">Ảnh đại diện</label>
                        <FilePond
                            files={files}
                            onupdatefiles={(fileItems) => {
                                setFiles(fileItems.map(item => item.file));
                                setErrors((prev) => ({ ...prev, avatar: "" }));
                            }}
                            allowMultiple={false}
                            maxFiles={1}
                            name="avatar"
                            labelIdle="Chọn ảnh hoặc kéo thả vào đây"
                        />
                        {errors.avatar && (
                            <span className="text-red-500 text-[11px] mt-[-12px]">
                            {errors.avatar}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col sm:col-span-2 col-span-1">
                        <label className="text-[13px] mb-[5px]">Vị trí</label>
                        <input type='number' onChange={(e) => setPosition(e.target.value)} value={position} id="position" className="px-[20px] py-[12px] bg-[#F5F6FA] rounded-[5px] outline-none border border-gray-300"></input>
                    </div>
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
                            <button className="sm:w-[270px] w-[200px] hover:bg-second rounded-[10px] sm:text-[20px] text-[16px] text-white bg-pri px-[20px] py-[20px]">Cập nhật danh mục</button>
                            <a href="/admin/category" className="text-pri hover:text-second sm:text-[20px] text-[16px] underline">Quay lại danh sách</a>
                        </div>
                    </div>    
                </div>
            </form>
        </>
    )
}
