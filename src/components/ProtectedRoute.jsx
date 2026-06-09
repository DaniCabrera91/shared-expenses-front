import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../features/auth/useCurrentUser";

export default function ProtectedRoute({ children }) {
  const { data: user, isLoading } = useCurrentUser();

  // ⏳ mientras comprobamos sesión
  if (isLoading) {
    return <div>Cargando...</div>;
  }

  // ❌ solo redirigir si realmente NO hay usuario
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
