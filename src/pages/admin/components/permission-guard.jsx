import { useEffect, useState } from "react";
import { fetchAdminUser } from "../../../config/api";
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

      // use helper that tries multiple endpoints and handles failures
      (async () => {
        try {
          const resp = await fetchAdminUser();
          const permissions = Array.isArray(resp?.data?.data?.permissions)
            ? resp.data.data.permissions
            : [];
          writeCache({ permissions });
          setAllowed(permissions.includes(permission));
        } catch (err) {
          setAllowed(false);
        } finally {
          setChecking(false);
        }
      })();
    }, [permission]);

  useEffect(() => {
    if (!checking && !allowed) {
      alert("Bạn không có đủ thẩm quyền vào trang này!");
      navigate("/admin/dashboard", { replace: true });
    }
  }, [checking, allowed, navigate]);

  // if (checking || !allowed) return null;
  if (checking) return null;
  return children;
}
