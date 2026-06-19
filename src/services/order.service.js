import { pathAdmin } from "../config/api";

export async function fetchOrders({
  keyword,
  status,
  method,
  payStatus,
  startDate,
  endDate,
  page = 1,
  limit = 10,
  token,
  signal,
} = {}) {
  const params = new URLSearchParams();
  if (keyword) params.append("keyword", keyword);
  if (status) params.append("status", status);
  if (method) params.append("method", method);
  if (payStatus) params.append("payStatus", payStatus);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  params.append("page", String(page));
  params.append("limit", String(limit));

  const headers = {
    Authorization: `Bearer ${token || localStorage.getItem("token")}`,
    "ngrok-skip-browser-warning": "true",
  };

  const res = await fetch(`${pathAdmin}/admin/order?${params.toString()}`, {
    method: "GET",
    headers,
    credentials: "include",
    signal,
  });
  return res.json();
}

export async function fetchOrderDetail(orderId, { token, signal } = {}) {
  const res = await fetch(`${pathAdmin}/admin/order/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token || localStorage.getItem("token")}`,
      "ngrok-skip-browser-warning": "true",
    },
    credentials: "include",
    signal,
  });
  return res.json();
}

export async function updateOrderStatus(orderId, payload, { token } = {}) {
  const res = await fetch(`${pathAdmin}/admin/order/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || localStorage.getItem("token")}`,
      "ngrok-skip-browser-warning": "true",
    },
    credentials: "include",
    body: JSON.stringify(payload || {}),
  });
  return { ok: res.ok, data: await res.json() };
}

export async function reviewOrderReturn(orderId, payload, { token } = {}) {
  const res = await fetch(
    `${pathAdmin}/admin/order/${orderId}/return-request`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include",
      body: JSON.stringify(payload || {}),
    },
  );
  return { ok: res.ok, data: await res.json() };
}
