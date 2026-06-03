import { pathAdmin } from "../config/api";

export async function fetchClients({ page = 1, keyword = '', limit = 10, token } = {}) {
  const t = token || localStorage.getItem('token');
  const url = `${pathAdmin}/admin/clients?page=${page}&limit=${limit}&keyword=${encodeURIComponent(keyword)}`;
  const headers = { Authorization: `Bearer ${t}`, 'ngrok-skip-browser-warning': 'true' };
  const res = await fetch(url, { method: 'GET', headers, credentials: 'include' });
  return res.json();
}
