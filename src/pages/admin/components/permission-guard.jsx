import { useEffect, useState } from "react";
import { pathAdmin } from "../../../config/api";
import { useNavigate } from "react-router-dom";
const CACHE_KEY = "admin_profile_cache";
const readCache = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.permissions || !Array.isArray(parsed.permissions)) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeCache = (data) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
  }
};

export default function PermissionGuard({ permission, children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setAllowed(cached.permissions.includes(permission));
    }

    const token = localStorage.getItem("token");
    fetch(`${pathAdmin}/admin/account/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const permissions = Array.isArray(data?.data?.permissions)
          ? data.data.permissions
          : [];
        writeCache({ permissions });
        setAllowed(permissions.includes(permission));
      })
      .catch(() => setAllowed(false))
      .finally(() => setChecking(false));
  }, [permission]);

  useEffect(() => {
    if (!checking && !allowed) {
      alert("Bạn không có đủ thẩm quyền vào trang này!");
      navigate("/admin/dashboard", { replace: true });
    }
  }, [checking, allowed, navigate]);

  if (checking || !allowed) return null;
  return children;
}
