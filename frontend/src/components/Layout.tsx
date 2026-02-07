import { ReactNode } from "react";
import { Me } from "../api/auth";
import { Topbar } from "./Topbar";

export function Layout({ user, children }: { user: Me; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Topbar user={user} />
      <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
    </div>
  );
}
