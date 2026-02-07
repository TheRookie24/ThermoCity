import { Link, useNavigate } from "react-router-dom";
import { Me, logout } from "../api/auth";

export function Topbar({ user }: { user: Me }) {
  const nav = useNavigate();
  return (
    <div className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-sm font-semibold tracking-wide">
            Thermal Infrastructure Monitoring Platform
          </div>
          <nav className="text-sm text-slate-700 flex gap-4">
            <Link className="hover:text-slate-900" to="/">Dashboard</Link>
            <Link className="hover:text-slate-900" to="/map">Map</Link>
            <Link className="hover:text-slate-900" to="/assets">Assets</Link>
            <Link className="hover:text-slate-900" to="/alerts">Alerts</Link>
            <Link className="hover:text-slate-900" to="/maintenance">Maintenance</Link>
            <Link className="hover:text-slate-900" to="/reports">Reports</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="text-slate-600">{user.username}</div>
          <div className="px-2 py-1 rounded border text-xs text-slate-700 bg-slate-50">{user.role}</div>
          <button
            className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm hover:bg-slate-800"
            onClick={async () => {
              await logout().catch(() => {});
              nav("/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
