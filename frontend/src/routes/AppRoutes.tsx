import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import OverviewPage from "../pages/OverviewPage";
import ThermalMapPage from "../pages/ThermalMapPage";
import AlertsPage from "../pages/AlertsPage";
import LoginPage from "../pages/LoginPage";
import RequireAuth from "./RequireAuth";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected area */}
      <Route element={<RequireAuth />}>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="thermal-map" element={<ThermalMapPage />} />
          <Route path="alerts" element={<AlertsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
}
