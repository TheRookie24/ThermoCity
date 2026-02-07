import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
