import { useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { pathAdmin } from "../../../config/api";

import { toast } from "react-toastify";

export default function DesignDelete({ design, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!design?._id || deleting) return;
    const confirmDelete = window.confirm(

      // `Bạn có chắc muốn xoá thiết kế "${design?.name || design?._id}"?`
      `Bạn có chắc muốn xoá thiết kế?`
    );
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem("token");
      // includeBundles=1: allow deleting bundle-backed designs
      const response = await fetch(`${pathAdmin}/admin/designs/${design._id}?includeBundles=1`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Xoá thất bại!");
      onDeleted?.(design._id);

      toast.success("Xoá thiết kế thành công!");
    } catch (error) {
      toast.error(error?.message || "Xoá thất bại!");

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

      title={deleting ? "Đang xoá..." : "Xoá thiết kế"}

    >
      <FaRegTrashCan className="text-[16px] text-[red] font-[700]" />
    </button>
  );
}
