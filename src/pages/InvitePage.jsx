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

  // Validar si el usuario está autenticado (sin retry para no esperar)
  const {
    data: user,
    isLoading: loadingUser,
    isError: userError,
  } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/users/me"),
    select: (res) => res.data.user,
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

  // Si no estás autenticado
  if (userError) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#f5f5f5",
        }}
      >
        <div
          style={{
            padding: "2rem",
            border: "1px solid #ddd",
            borderRadius: "8px",
            maxWidth: "400px",
            textAlign: "center",
            background: "white",
          }}
        >
          <h1>
            {invitation?.groupEmoji || "💰"} {invitation?.groupName}
          </h1>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>
            Te han invitado a unirte a este grupo.
          </p>

          <div
            style={{
              background: "#fff3cd",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              border: "1px solid #ffc107",
            }}
          >
            <p style={{ margin: "0.5rem 0", color: "#856404" }}>
              <strong>Necesitas una cuenta para unirte.</strong>
            </p>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            <a
              href="/login"
              style={{
                display: "inline-block",
                width: "100%",
                padding: "0.75rem 1.5rem",
                background: "#1976d2",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
                cursor: "pointer",
                boxSizing: "border-box",
                textAlign: "center",
              }}
            >
              Iniciar sesión
            </a>

            <a
              href="/register"
              style={{
                display: "inline-block",
                width: "100%",
                padding: "0.75rem 1.5rem",
                background: "#4caf50",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
                cursor: "pointer",
                boxSizing: "border-box",
                textAlign: "center",
              }}
            >
              Crear cuenta
            </a>
          </div>

          <p style={{ color: "#999", fontSize: "0.875rem", marginTop: "1rem" }}>
            El link expira el{" "}
            {new Date(invitation?.expiresAt).toLocaleDateString("es-ES")}
          </p>
        </div>
      </div>
    );
  }

  if (loadingUser || loadingInvitation) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        Cargando...
      </div>
    );
  }

  if (invitationError) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#f5f5f5",
        }}
      >
        <div
          style={{
            padding: "2rem",
            border: "1px solid #ddd",
            borderRadius: "8px",
            maxWidth: "400px",
            textAlign: "center",
            background: "white",
          }}
        >
          <h2>Invitación no válida</h2>
          <p>
            {invitationError.response?.status === 410
              ? "Esta invitación ha expirado."
              : "Esta invitación no existe."}
          </p>
        </div>
      </div>
    );
  }

  // Si estás autenticado, mostrar opción para unirse
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          padding: "2rem",
          border: "1px solid #ddd",
          borderRadius: "8px",
          maxWidth: "400px",
          textAlign: "center",
          background: "white",
        }}
      >
        <h1>
          {invitation?.groupEmoji || "💰"} {invitation?.groupName}
        </h1>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>
          Te han invitado a unirte a este grupo.
        </p>

        <div
          style={{
            background: "#f5f5f5",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
          }}
        >
          <p style={{ margin: "0.5rem 0", color: "#666" }}>
            <strong>Válido hasta:</strong>{" "}
            {new Date(invitation?.expiresAt).toLocaleDateString("es-ES")}
          </p>
        </div>

        <button
          onClick={handleJoin}
          disabled={joining}
          style={{
            width: "100%",
            padding: "0.75rem 1.5rem",
            background: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          {joining ? "Uniéndose..." : "Unirme al grupo"}
        </button>
      </div>
    </div>
  );
}
