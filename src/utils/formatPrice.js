export default function formatPrice(price) {
	return Number(price).toLocaleString("vi-VN") + "₫";
}
