import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import {
  useValidateInvitation,
  useJoinGroup,
} from "../features/invitations/useInvitations";

export default function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const cleanToken =
    token && token !== "undefined" && token !== "null" ? token : null;

  // 👉 SOLO si vienes de login/register desde invite
  const cameFromAuth = location.state?.fromInvite;

  // ---------------- USER ----------------
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/users/me"),
    select: (res) => res.data.user,
    retry: false,
  });

  // ---------------- INVITE ----------------
  const {
    data: invitation,
    isLoading: loadingInvitation,
    error: invitationError,
  } = useValidateInvitation(cleanToken);

  const { mutate: joinGroup, isLoading: joining } = useJoinGroup();

  const hasAutoJoined = useRef(false);

  // ---------------- AUTO JOIN (SOLO UNA VEZ Y CON INTENCIÓN) ----------------
  useEffect(() => {
    if (!cameFromAuth) return;
    if (!user || !invitation || !cleanToken) return;
    if (joining || hasAutoJoined.current) return;

    hasAutoJoined.current = true;

    joinGroup(cleanToken, {
      onSuccess: (res) => {
        navigate(`/groups/${res.data.groupId}`, { replace: true });
      },
    });
  }, [user, invitation, cleanToken, joining, cameFromAuth]);

  // ---------------- LOADING ----------------
  if (loadingUser || loadingInvitation) {
    return <div>Cargando...</div>;
  }

  // ---------------- ERROR ----------------
  if (invitationError) {
    return <div>Invitación no válida</div>;
  }

  // ---------------- NOT LOGGED IN ----------------
  if (!user) {
    return (
      <div>
        <h1>
          {invitation?.groupEmoji} {invitation?.groupName}
        </h1>

        <p>Necesitas una cuenta para unirte a este grupo</p>

        <button
          onClick={() =>
            navigate("/login", {
              state: {
                fromInvite: true,
                token: cleanToken,
              },
            })
          }
        >
          Iniciar sesión
        </button>

        <button
          onClick={() =>
            navigate("/register", {
              state: {
                fromInvite: true,
                token: cleanToken,
              },
            })
          }
        >
          Crear cuenta
        </button>
      </div>
    );
  }

  // ---------------- LOGGED IN (fallback manual) ----------------
  return (
    <div>
      <h1>
        {invitation?.groupEmoji} {invitation?.groupName}
      </h1>

      <button
        onClick={() =>
          joinGroup(cleanToken, {
            onSuccess: (res) => {
              navigate(`/groups/${res.data.groupId}`, { replace: true });
            },
          })
        }
        disabled={joining}
      >
        Unirme al grupo
      </button>
    </div>
  );
}
