import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { me, Me } from "../api/auth";
import { Layout } from "../components/Layout";

export function Protected() {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-sm text-slate-600">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <Layout user={user}>
      <Outlet />
    </Layout>
  );
}
