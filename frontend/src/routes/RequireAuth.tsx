import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { me } from "../api/auth";

export default function RequireAuth() {
  const [ok, setOk] = useState<boolean | null>(null);
  const loc = useLocation();

  useEffect(() => {
    me()
      .then(() => setOk(true))
      .catch(() => setOk(false));
  }, []);

  if (ok === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-600">
        Loading…
      </div>
    );
  }

  if (!ok) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  return <Outlet />;
}
