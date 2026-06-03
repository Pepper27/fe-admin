import { pathAdmin } from "../config/api";

export async function fetchCategoryList({ page = 1, keyword = '', categoryId = '', startDate = '', endDate = '', limit = 10, token } = {}) {
  const url = `${pathAdmin}/admin/categories?page=${page}&limit=${limit}&keyword=${encodeURIComponent(keyword)}&categoryId=${categoryId}&startDate=${startDate}&endDate=${endDate}`;
  const headers = {
    Authorization: `Bearer ${token || localStorage.getItem('token')}`,
    'ngrok-skip-browser-warning': 'true',
  };
  const res = await fetch(url, { method: 'GET', headers, credentials: 'include' });
  return res.json();
}

export async function fetchCategoryTree(token) {
  const tryUrls = [
    `${pathAdmin}/admin/categories/parent`,
    `${pathAdmin}/v1/admin/categories/parent`,
    `${pathAdmin}/v1/admin/categories`,
    `${pathAdmin}/admin/categories`,
  ];
  const t = token || localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${t}`, 'ngrok-skip-browser-warning': 'true' };
  for (const url of tryUrls) {
    try {
      const res = await fetch(url, { method: 'GET', headers, credentials: 'include' });
      if (res.status === 404) continue;
      const data = await res.json();
      if (data?.code === 'error') continue;
      return data;
    } catch (err) {
      continue;
    }
  }
  return null;
}
