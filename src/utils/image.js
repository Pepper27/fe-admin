export function getProductImage(product) {
	return product?.variants?.[0]?.images?.[0] || "";
}
