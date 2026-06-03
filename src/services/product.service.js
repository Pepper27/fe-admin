import { pathAdmin } from "../config/api";

export async function fetchProductList(params, token, signal) {
  const search = new URLSearchParams(params).toString();
  const res = await fetch(`${pathAdmin}/admin/products?${search}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    credentials: "include",
    signal,
  });
  return res.json();
}

export async function fetchCreators(token) {
  const res = await fetch(`${pathAdmin}/admin/account`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    credentials: "include",
  });
  return res.json();
}

export async function fetchCategories(token) {
  const res = await fetch(`${pathAdmin}/admin/categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    credentials: "include",
  });
  return res.json();
}
