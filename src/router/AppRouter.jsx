import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import GroupsPage from "../pages/GroupsPage";
import GroupPage from "../pages/GroupPage";
import InvitePage from "../pages/InvitePage";
import ProtectedRoute from "../components/ProtectedRoute";
import Layout from "../components/Layout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/invite/:token" element={<InvitePage />} />

        {/* protegida con layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:groupId" element={<GroupPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
