import { pathAdmin } from "../config/api";

export async function fetchClients({ page = 1, keyword = '', limit = 10, token } = {}) {
  const t = token || localStorage.getItem('token');
  const url = `${pathAdmin}/admin/clients?page=${page}&limit=${limit}&keyword=${encodeURIComponent(keyword)}`;
  const headers = { Authorization: `Bearer ${t}`, 'ngrok-skip-browser-warning': 'true' };
  const res = await fetch(url, { method: 'GET', headers, credentials: 'include' });
  return res.json();
}

export async function updateClientStatus(id, status, token) {
  const t = token || localStorage.getItem('token');
  const res = await fetch(`${pathAdmin}/admin/clients/${id}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${t}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, data };
}
