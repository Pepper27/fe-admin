import { useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

import { pathAdmin } from "../../../config/api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { toast } from "react-toastify";


registerPlugin(FilePondPluginImagePreview);

export default function BlogCreate() {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Tên bài viết không được để trống";
    if (!content.trim()) newErrors.content = "Nội dung không được để trống";
    if (files.length === 0) newErrors.avatar = "Vui lòng chọn ảnh đại diện";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlerSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const token = localStorage.getItem("token");
    const dataFinal = new FormData();
    dataFinal.append("name", name);
    dataFinal.append("content", content);
    if (files.length > 0) dataFinal.append("avatar", files[0]);

    fetch(`${pathAdmin}/admin/blogs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: dataFinal,
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Tạo thất bại");
        return data;

      })
      .then(() => {
        toast.success("Tạo bài viết thành công!");
        navigate("/admin/blog");
      })
      .catch((err) => {
        toast.error(err?.message || "Tạo thất bại");
      });
  };

  return (
    <>
      <form
        onSubmit={handlerSubmit}
        className="xl:w-[calc(100%-240px)] lg:w-[calc(100%-220px)] w-full mt-[100px] lg:ml-[240px] l-0 flex flex-col mx-[16px] sm:px-[30px] px-[10px] sm:pr-[55px] pr-[30px]"
      >
        <div className="sm:text-[30px] text-[20px] font-[700] mb-[30px]">Tạo bài viết</div>
        <div className="mb-[30px] grid sm:grid-cols-2 grid-cols-1 gap-y-[20px] gap-x-[30px] bg-[white] sm:py-[30px] py-[20px] sm:px-[40px] px-[20px] border border-gray-300 rounded-[15px]">
          <div className="flex flex-col sm:col-span-2 col-span-1">
            <label className="text-[13px] mb-[5px]">Tên bài viết</label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: "" }));
              }}
              className={`px-[20px] py-[12px] bg-[#F5F6FA] rounded-[5px] outline-none border ${errors.name ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.name && <span className="text-red-500 text-[11px] mt-[4px]">{errors.name}</span>}
          </div>

          <div className="flex flex-col sm:col-span-2 col-span-1">
            <label className="text-[13px] mb-[5px]">Ảnh đại diện</label>
            <FilePond
              files={files}
              onupdatefiles={(fileItems) => {
                setFiles(fileItems.map((item) => item.file));
                setErrors((prev) => ({ ...prev, avatar: "" }));
              }}
              allowMultiple={false}
              maxFiles={1}
              name="avatar"
              labelIdle="Chọn ảnh hoặc kéo thả vào đây"
            />
            {errors.avatar && <span className="text-red-500 text-[11px] mt-[-12px]">{errors.avatar}</span>}
          </div>

          <div className="flex flex-col sm:col-span-2 col-span-1">
            <label htmlFor="content" className="text-[13px] mb-[5px]">Nội dung</label>
            <div className={`${errors.content ? "border border-red-500 rounded-[5px]" : ""}`}>
              <Editor
                apiKey="4za2bx0zr5zze6b3ux1l4un4bnkypmn6nr1vlsmnhpy3iqrm"
                init={{
                  plugins: [
                    "anchor",
                    "autolink",
                    "charmap",
                    "codesample",
                    "emoticons",
                    "link",
                    "lists",
                    "media",
                    "searchreplace",
                    "table",
                    "visualblocks",
                    "wordcount",
                  ],
                  toolbar:
                    "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | " +
                    "link media table | align lineheight | numlist bullist indent outdent | " +
                    "emoticons charmap | removeformat",
                }}
                initialValue=""
                onEditorChange={(content) => {
                  setContent(content);
                  setErrors((prev) => ({ ...prev, content: "" }));
                }}
                value={content}
                id="content "
              />
              {errors.content && <span className="text-red-500 text-[11px] mt-[4px]">{errors.content}</span>}
            </div>

            <div className="mt-[30px] flex flex-col items-center gap-y-[20px]">
              <button className="sm:w-[270px] w-[200px] hover:bg-second rounded-[10px] sm:text-[20px] text-[16px] text-white bg-pri px-[20px] py-[20px]">
                Tạo bài viết
              </button>
              <Link
                to="/admin/collection"
                className="text-pri hover:text-second sm:text-[20px] text-[16px] underline"
              >
                Quay lại danh sách
              </Link>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
