import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/loginPage";
import DashboardPage from "../pages/dashboardPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
