import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "../pages/Login";
import { Dashboard } from "../pages/Dashboard";
import { MapPage } from "../pages/Map";
import { Assets } from "../pages/Assets";
import { SegmentDetail } from "../pages/SegmentDetail";
import { Alerts } from "../pages/Alerts";
import { Maintenance } from "../pages/Maintenance";
import { Reports } from "../pages/Reports";
import { Protected } from "./Protected";

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<Protected />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/segments/:id" element={<SegmentDetail />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/reports" element={<Reports />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
