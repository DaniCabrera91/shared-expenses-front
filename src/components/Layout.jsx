import { Outlet, Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export default function Layout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    localStorage.removeItem("token");
    queryClient.clear();
    navigate("/login");
  };

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <header
        style={{
          padding: "1rem 2rem",
          borderBottom: "1px solid #eee",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <nav style={{ display: "flex", gap: "1rem" }}>
          <Link to="/">Dashboard</Link>
          <Link to="/groups">Grupos</Link>
        </nav>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </header>

      <main style={{ padding: "2rem", flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
