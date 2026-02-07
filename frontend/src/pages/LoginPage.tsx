import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

export default function LoginPage() {
  const nav = useNavigate();
  const [username, setU] = useState("admin");
  const [password, setP] = useState("admin123");
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold tracking-wide">
          Thermal Infrastructure Monitoring Platform
        </div>
        <div className="mt-1 text-xs text-slate-500">Sign in</div>

        <div className="mt-6 space-y-3">
          <div>
            <label className="text-xs text-slate-600">Username</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={username}
              onChange={(e) => setU(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-600">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={password}
              onChange={(e) => setP(e.target.value)}
            />
          </div>

          {err ? <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">{err}</div> : null}

          <button
            className="w-full rounded-lg bg-slate-900 py-2.5 text-sm text-white hover:bg-slate-800"
            onClick={async () => {
              setErr(null);
              try {
                await login(username, password);
                nav("/");
              } catch (e: any) {
                setErr(e.message || "Login failed");
              }
            }}
          >
            Sign in
          </button>

          <div className="text-xs text-slate-500">
            Demo users: admin/admin123, engineer/engineer123, ops/ops123, viewer/viewer123
          </div>
        </div>
      </div>
    </div>
  );
}
