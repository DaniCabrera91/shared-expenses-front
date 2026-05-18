import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { api } from "../api/client";

export default function ProtectedRoute({ children }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/users/me"),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  // ⏳ mientras comprobamos sesión
  if (isLoading) {
    return <div>Cargando...</div>;
  }

  // ❌ solo redirigir si realmente NO hay usuario
  if (!user?.data?.user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
