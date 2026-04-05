import { useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { pathAdmin } from "../../../config/api";

export default function ProductDelete({ product, onDeleted }) {
	const [deleting, setDeleting] = useState(false);

	const handleDelete = async () => {
		if (!product?._id || deleting) return;

		const confirmDelete = window.confirm(
			`Bạn có chắc muốn xoá sản phẩm? "${product?.name || ""}"?`
		);
		if (!confirmDelete) return;

		try {
			setDeleting(true);
			const token = localStorage.getItem("token");

			const response = await fetch(`${pathAdmin}/admin/products/${product._id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
					"ngrok-skip-browser-warning": "true",
				},
				credentials: "include",
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data?.message || "Xoá sản phẩm thất bại!");
			}

			onDeleted?.(product._id);
			alert(data?.message || "Xoá sản phẩm thành công!");
		} catch (error) {
			console.error("Delete product failed", error);
			alert(error?.message || "Xoá sản phẩm thất bại!");
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
			title={deleting ? "Đang xoá..." : "Xoá sản phẩm"}
		>
			<FaRegTrashCan className="text-[16px] text-[red] font-[700]" />
		</button>
	);
}
