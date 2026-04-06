import { useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { pathAdmin } from "../../../config/api";

export default function CategoryDelete({ category, onDeleted }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!category?._id || deleting) return;
        const confirmDelete = window.confirm(
            `Bạn có chắc muốn xoá danh mục "${category?.name || ""}"?`
        );
        if (!confirmDelete) return;

        try {
            setDeleting(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${pathAdmin}/admin/categories/${category._id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "ngrok-skip-browser-warning": "true",
                },
                credentials: "include",
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data?.message || "Xoá thất bại!");
            onDeleted?.(category._id);
            alert(data?.message || "Xoá thành công!");
        } catch (error) {
            alert(error?.message || "Xoá thất bại!");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            className="rounded-r-[10px] text-[14px] p-[15px] bg-[white] border border-gray-300 disabled:opacity-50"
            title={deleting ? "Đang xoá..." : "Xoá danh mục"}
        >
            <FaRegTrashCan className="text-[16px] text-[red] font-[700]" />
        </button>
    );
}
