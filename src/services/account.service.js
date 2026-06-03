import { pathAdmin } from "../config/api";

export async function fetchAccountsAndRoles(token) {
  const t = token || localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${t}`, 'ngrok-skip-browser-warning': 'true' };
  const [accountRes, roleRes] = await Promise.all([
    fetch(`${pathAdmin}/admin/account`, { headers, credentials: 'include' }),
    fetch(`${pathAdmin}/admin/roles/all`, { headers, credentials: 'include' }),
  ]);
  const accountData = await accountRes.json().catch(() => ({}));
  const roleData = await roleRes.json().catch(() => ({}));
  return { accountData, roleData };
}

export async function deleteAccount(id, token) {
  const t = token || localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${t}`, 'ngrok-skip-browser-warning': 'true' };
  const res = await fetch(`${pathAdmin}/admin/account/${id}`, { method: 'DELETE', headers, credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}
