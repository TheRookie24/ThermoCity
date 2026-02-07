import { NavLink, Outlet } from "react-router-dom";

function TopNav() {
  const linkBase =
    "px-3 py-2 text-sm font-medium rounded-md transition-colors";
  const active = "text-emerald-700 bg-emerald-50";
  const inactive = "text-slate-600 hover:text-slate-900 hover:bg-slate-50";

  return (
    <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600" />
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">
                Thermal Platform
              </div>
              <div className="text-xs text-slate-500">Monitoring</div>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <NavLink
              to="/overview"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : inactive}`
              }
            >
              Overview
            </NavLink>
            <NavLink
              to="/thermal-map"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : inactive}`
              }
            >
              Thermal Map
            </NavLink>
            <NavLink
              to="/alerts"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : inactive}`
              }
            >
              Alerts & Workorders
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
            City Engineer
          </span>
          <div className="h-9 w-9 rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopNav />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-slate-500">
          © {new Date().getFullYear()} Thermal Infrastructure Monitoring Platform
        </div>
      </footer>
    </div>
  );
}
