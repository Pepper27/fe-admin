// import { pathAdmin } from "../config/api";

// export async function fetchProductList(params, token, signal) {
// 	const search = new URLSearchParams(params).toString();
// 	const res = await fetch(`${pathAdmin}/admin/products?${search}`, {
// 		method: "GET",
// 		headers: {
// 			Authorization: `Bearer ${token}`,
// 			"ngrok-skip-browser-warning": "true",
// 		},
// 		credentials: "include",
// 		signal,
// 	});
// 	return res.json();
// }

// export async function fetchCreators(token) {
// 	const res = await fetch(`${pathAdmin}/admin/account`, {
// 		headers: {
// 			Authorization: `Bearer ${token}`,
// 			"ngrok-skip-browser-warning": "true",
// 		},
// 		credentials: "include",
// 	});
// 	return res.json();
// }

// export async function fetchCategories(token) {
// 	const res = await fetch(`${pathAdmin}/admin/categories`, {
// 		headers: {
// 			Authorization: `Bearer ${token}`,
// 			"ngrok-skip-browser-warning": "true",
// 		},
// 		credentials: "include",
// 	});
// 	return res.json();
// }

// export function getDisplayPrice(product, formatPrice) {
// 	const prices = (product?.variants || [])
// 		.map((v) => Number(v?.price))
// 		.filter((p) => Number.isFinite(p));
// 	if (!prices.length) return "0₫";
// 	const min = Math.min(...prices);
// 	const max = Math.max(...prices);
// 	if (min === max) return formatPrice(min);
// 	return `${formatPrice(min)} - ${formatPrice(max)}`;
// }
