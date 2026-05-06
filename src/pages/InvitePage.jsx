import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useValidateInvitation,
  useJoinGroup,
} from "../features/invitations/useInvitations";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";

export default function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();

  // Validar si el usuario está autenticado
  const {
    data: user,
    isLoading: loadingUser,
    isError: userError,
  } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/users/me"),
    retry: false,
  });

  // Validar token de invitación
  const {
    data: invitation,
    isLoading: loadingInvitation,
    error: invitationError,
  } = useValidateInvitation(token);

  const { mutate: joinGroup, isLoading: joining } = useJoinGroup();

  const handleJoin = () => {
    joinGroup(token, {
      onSuccess: (response) => {
        const groupId = response.data.groupId;
        navigate(`/groups/${groupId}`);
      },
      onError: (error) => {
        console.error("Error al unirse:", error);
      },
    });
  };

  if (userError) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Necesitas estar autenticado</h2>
        <p>Por favor, inicia sesión para unirte al grupo.</p>
        <a href="/login">Ir a login</a>
      </div>
    );
  }

  if (loadingUser || loadingInvitation) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Cargando...</div>
    );
  }

  if (invitationError) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Invitación no válida</h2>
        <p>
          {invitationError.response?.status === 410
            ? "Esta invitación ha expirado."
            : "Esta invitación no existe."}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          padding: "2rem",
          border: "1px solid #ddd",
          borderRadius: "8px",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <h1>
          {invitation?.groupEmoji || "💰"} {invitation?.groupName}
        </h1>
        <p style={{ color: "#666" }}>Te han invitado a unirte a este grupo.</p>

        <div
          style={{
            background: "#f5f5f5",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
          }}
        >
          <p style={{ margin: "0.5rem 0" }}>
            <strong>Tu usuario:</strong>{" "}
            {user?.data?.alias || user?.data?.email}
          </p>
          <p style={{ margin: "0.5rem 0" }}>
            <strong>Expira:</strong>{" "}
            {new Date(invitation?.expiresAt).toLocaleDateString("es-ES")}
          </p>
        </div>

        <button
          onClick={handleJoin}
          disabled={joining}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          {joining ? "Uniéndose..." : "Unirme al grupo"}
        </button>
      </div>
    </div>
  );
}
