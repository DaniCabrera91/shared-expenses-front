import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { api } from "../api/client";

export default function ProtectedRoute({ children }) {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/users/me"),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 min cache
  });

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (isError || !user?.data) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
