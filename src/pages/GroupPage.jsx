import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGroup } from "../features/groups/useGroup";
import { useGroupMembers } from "../features/groups/useGroupMembers";
import { useUpdateMemberRole } from "../features/groups/useUpdateMemberRole";
import { useRemoveMember } from "../features/groups/useRemoveMember";
import { useGroupExpenses } from "../features/expenses/useGroupExpenses";
import { useGroupBalances } from "../features/expenses/useGroupBalances";
import { useGroupSettlements } from "../features/expenses/useGroupSettlements";
import { useCreateExpense } from "../features/expenses/useCreateExpense";
import { useDeleteExpense } from "../features/expenses/useDeleteExpense";
import { useUpdateExpense } from "../features/expenses/useUpdateExpense";
import { useCreateInvitation } from "../features/invitations/useInvitations";
import { useArchiveGroup } from "../features/groups/useArchiveGroup";
import { useLeaveGroup } from "../features/groups/useLeaveGroup";
import { useCurrentUser } from "../features/auth/useCurrentUser";
import { useGroupNotifications } from "../features/notifications/useGroupNotifications";
import { formatCurrency } from "../utils/format";
import { useCreateSettlement } from "../features/expenses/useCreateSettlement";

export default function GroupPage() {
  const { groupId } = useParams();
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [formError, setFormError] = useState("");
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("");
  const [invitationError, setInvitationError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editTotalAmount, setEditTotalAmount] = useState("");
  const [editPaidBy, setEditPaidBy] = useState("");
  const [editError, setEditError] = useState("");
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removeError, setRemoveError] = useState("");
  const [archiveMessage, setArchiveMessage] = useState("");
  const [leaveError, setLeaveError] = useState("");

  // Obtener usuario actual para verificar si es admin
  const { data: currentUserData, isLoading: loadingUser } = useCurrentUser();

  const {
    data: group,
    isLoading: loadingGroup,
    error: groupError,
  } = useGroup(groupId);
  const {
    data: members,
    isLoading: loadingMembers,
    error: membersError,
  } = useGroupMembers(groupId);
  const {
    data: expenses,
    isLoading: loadingExpenses,
    error: expensesError,
  } = useGroupExpenses(groupId);
  const {
    data: balances,
    isLoading: loadingBalances,
    error: balancesError,
  } = useGroupBalances(groupId);
  const {
    data: settlements,
    isLoading: loadingSettlements,
    error: settlementsError,
  } = useGroupSettlements(groupId);

  const { mutate, isLoading: creatingExpense } = useCreateExpense(groupId);
  const { mutate: createInvitation, isLoading: creatingInvitation } =
    useCreateInvitation(groupId);
  const { mutate: deleteExpense, isLoading: deletingExpense } =
    useDeleteExpense(groupId);
  const { mutate: updateExpense, isLoading: updatingExpense } =
    useUpdateExpense(groupId);
  const { mutate: archiveGroup, isLoading: archivingGroup } = useArchiveGroup();
  const { mutate: leaveGroup, isLoading: leavingGroup } = useLeaveGroup();
  const { mutate: updateMemberRole, isLoading: updatingMemberRole } =
    useUpdateMemberRole(groupId);
  const { mutate: removeMember, isLoading: removingMember } =
    useRemoveMember(groupId);
  const {
    data: notifications,
    isLoading: loadingNotifications,
    error: notificationsError,
  } = useGroupNotifications(groupId);

  const { mutate: createSettlement, isLoading: creatingSettlement } =
    useCreateSettlement(groupId);

  const [updatingMemberId, setUpdatingMemberId] = useState(null);
  const [memberRoleError, setMemberRoleError] = useState("");

  // Verificar si el usuario actual es admin
  const isAdmin =
    currentUserData &&
    members?.some((m) => m.id === currentUserData.id && m.role === "admin");

  const getNotificationIcon = (type) => {
    switch (type) {
      case "expense_created":
        return "💸";
      case "expense_updated":
        return "✏️";
      case "member_joined":
        return "👋";
      case "invitation_sent":
        return "📩";
      case "group_archived":
        return "🗄️";
      case "group_unarchived":
        return "📤";
      case "member_removed":
        return "🚫";
      case "member_left":
        return "👤";
      case "member_promoted":
        return "⭐";
      case "member_demoted":
        return "⬇️";
      default:
        return "ℹ️";
    }
  };

  const handleChangeMemberRole = (userId, role) => {
    setMemberRoleError("");
    setUpdatingMemberId(userId);

    updateMemberRole(
      { userId, role },
      {
        onSuccess: () => {
          setUpdatingMemberId(null);
        },
        onError: (error) => {
          setUpdatingMemberId(null);
          setMemberRoleError(
            error.response?.data?.error ||
              error.message ||
              "No se pudo actualizar el rol.",
          );
        },
      },
    );
  };

  if (loadingGroup || loadingMembers || loadingExpenses || loadingBalances) {
    return <div>Cargando grupo...</div>;
  }

  if (groupError || membersError || expensesError || balancesError) {
    return <div>No se pudo cargar el grupo.</div>;
  }

  if (!group) {
    return <div>Grupo no encontrado.</div>;
  }

  const memberNamesById = members?.reduce((acc, member) => {
    acc[member.id] = `${member.first_name} ${member.last_name}`;
    return acc;
  }, {});

  const selectedPaidBy = paidBy || members?.[0]?.id || "";

  const handleCreateInvitation = () => {
    setInvitationError("");
    createInvitation(7, {
      onSuccess: (response) => {
        setGeneratedToken(response.data.token);
      },
      onError: (error) => {
        setInvitationError(
          error.response?.data?.message || "No se pudo generar la invitación.",
        );
      },
    });
  };

  const copyToClipboard = () => {
    const invitationLink = `${window.location.origin}/invite/${generatedToken}`;
    navigator.clipboard.writeText(invitationLink);
    alert("Link copiado al portapapeles");
  };

  const handleArchiveGroup = () => {
    setArchiveMessage("");
    archiveGroup(groupId, {
      onSuccess: () => {
        setArchiveMessage(
          "Grupo archivado. Puedes recuperarlo desde Mis Grupos → Grupos archivados.",
        );
      },
      onError: (error) => {
        setArchiveMessage(
          error.response?.data?.error ||
            error.message ||
            "No se pudo archivar el grupo.",
        );
      },
    });
  };

  const handleLeaveGroup = () => {
    setLeaveError("");
    leaveGroup(groupId, {
      onSuccess: () => {
        window.location.href = "/groups";
      },
      onError: (error) => {
        setLeaveError(
          error.response?.data?.error ||
            error.message ||
            "No se pudo abandonar el grupo.",
        );
      },
    });
  };

  const handleDeleteExpense = (expenseId) => {
    deleteExpense(expenseId, {
      onSuccess: () => {
        setDeleteConfirm(null);
      },
      onError: (error) => {
        console.error("Error al eliminar:", error);
      },
    });
  };

  const startEditExpense = (expense) => {
    setEditingExpense(expense);
    setEditDescription(expense.description || "");
    setEditTotalAmount(String(expense.total_amount || ""));
    setEditPaidBy(expense.paid_by || members?.[0]?.id || "");
    setEditError("");
  };

  const handleUpdateExpense = (event) => {
    event.preventDefault();
    setEditError("");

    const amount = Number(editTotalAmount);
    if (!editDescription.trim()) {
      setEditError("La descripción es obligatoria.");
      return;
    }
    if (!amount || amount <= 0) {
      setEditError("Introduce un importe válido.");
      return;
    }
    if (!editPaidBy) {
      setEditError("Selecciona quién pagó el gasto.");
      return;
    }

    const baseShare = Math.floor((amount / members.length) * 100) / 100;
    const shares = members.map((member, index) => ({
      user_id: member.id,
      amount_owed:
        index === members.length - 1
          ? Number((amount - baseShare * (members.length - 1)).toFixed(2))
          : baseShare,
    }));

    updateExpense(
      {
        expenseId: editingExpense.id,
        data: {
          description: editDescription.trim(),
          total_amount: amount,
          currency: group.currency,
          paid_by: editPaidBy,
          shares,
        },
      },
      {
        onSuccess: () => {
          setEditingExpense(null);
          setEditDescription("");
          setEditTotalAmount("");
          setEditPaidBy("");
        },
        onError: (error) => {
          setEditError(
            error.response?.data?.message ||
              error.message ||
              "No se pudo actualizar el gasto.",
          );
        },
      },
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");

    const amount = Number(totalAmount);
    if (!description.trim()) {
      setFormError("La descripción es obligatoria.");
      return;
    }
    if (!amount || amount <= 0) {
      setFormError("Introduce un importe válido.");
      return;
    }
    if (!selectedPaidBy) {
      setFormError("Selecciona quién pagó el gasto.");
      return;
    }

    const baseShare = Math.floor((amount / members.length) * 100) / 100;
    const shares = members.map((member, index) => ({
      user_id: member.id,
      amount_owed:
        index === members.length - 1
          ? Number((amount - baseShare * (members.length - 1)).toFixed(2))
          : baseShare,
    }));

    mutate(
      {
        description: description.trim(),
        total_amount: amount,
        currency: group.currency,
        paid_by: selectedPaidBy,
        shares,
      },
      {
        onSuccess: () => {
          setDescription("");
          setTotalAmount("");
          setPaidBy("");
        },
        onError: (error) => {
          setFormError(
            error.response?.data?.message ||
              error.message ||
              "No se pudo crear el gasto.",
          );
        },
      },
    );
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div>
          <Link to="/groups">← Volver a mis grupos</Link>
          <h1 style={{ marginTop: "0.5rem" }}>
            {group.emoji || "💰"} {group.name}
          </h1>
          <p style={{ color: "#666" }}>Moneda: {group.currency}</p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {isAdmin && (
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={handleArchiveGroup}
                disabled={archivingGroup}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#ff9800",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {archivingGroup ? "Archivando..." : "Archivar grupo"}
              </button>

              <button
                type="button"
                onClick={() => setShowInvitationModal(true)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Generar invitación
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowLeaveConfirm(true)}
            style={{
              padding: "0.5rem 1rem",
              background: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Abandonar grupo
          </button>
        </div>
      </div>

      {archiveMessage && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "1rem",
            background: "#fff8e1",
            color: "#795548",
            borderRadius: "8px",
            border: "1px solid #ffe0b2",
          }}
        >
          {archiveMessage}
        </div>
      )}

      {leaveError && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "1rem",
            background: "#ffebee",
            color: "#b71c1c",
            borderRadius: "8px",
            border: "1px solid #ffcdd2",
          }}
        >
          {leaveError}
        </div>
      )}

      <section
        style={{
          marginBottom: "2rem",
          padding: "1rem",
          background: "#f5f5f5",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Actividad reciente</h2>
            <p style={{ margin: "0.25rem 0 0", color: "#666" }}>
              Últimos eventos del grupo y cambios recientes.
            </p>
          </div>
          <span style={{ color: "#666", fontSize: "0.9rem" }}>
            {notifications ? notifications.length : 0} eventos
          </span>
        </div>

        {loadingNotifications ? (
          <p>Cargando notificaciones...</p>
        ) : notificationsError ? (
          <p>No se pudieron cargar las notificaciones.</p>
        ) : !notifications || notifications.length === 0 ? (
          <p style={{ color: "#666" }}>
            No hay notificaciones recientes para este grupo.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {notifications.map((notification) => (
              <li
                key={notification.id}
                style={{
                  padding: "0.75rem",
                  borderBottom: "1px solid #ddd",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "0.75rem",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "1.25rem" }}>
                  {getNotificationIcon(notification.type)}
                </span>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>
                    {notification.message}
                  </p>
                  <p style={{ margin: "0.25rem 0 0", color: "#666" }}>
                    {notification.actor_name} ·{" "}
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showLeaveConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h2>Abandonar grupo</h2>
            <p style={{ color: "#666", marginBottom: "1rem" }}>
              Si abandonas el grupo, perderás acceso y tendrás que recibir una
              nueva invitación para volver a unirte.
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={handleLeaveGroup}
                disabled={leavingGroup}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  background: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {leavingGroup ? "Saliendo..." : "Sí, abandonar"}
              </button>
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(false)}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  background: "#ccc",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {memberToRemove && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h2>Eliminar miembro</h2>
            <p style={{ color: "#666", marginBottom: "1rem" }}>
              ¿Estás seguro de que quieres eliminar a{" "}
              {memberToRemove.first_name} {memberToRemove.last_name} del grupo?
            </p>
            {removeError && (
              <div style={{ color: "#b71c1c", marginBottom: "1rem" }}>
                {removeError}
              </div>
            )}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => {
                  removeMember(memberToRemove.id, {
                    onSuccess: () => setMemberToRemove(null),
                    onError: (error) => {
                      setRemoveError(
                        error.response?.data?.error ||
                          error.message ||
                          "No se pudo eliminar al miembro.",
                      );
                    },
                  });
                }}
                disabled={removingMember}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  background: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {removingMember ? "Eliminando..." : "Sí, eliminar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMemberToRemove(null);
                  setRemoveError("");
                }}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  background: "#ccc",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de invitación */}
      {showInvitationModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h2>Generar invitación</h2>

            {!generatedToken ? (
              <div>
                <p style={{ color: "#666", marginBottom: "1rem" }}>
                  Crea un link de invitación válido por 7 días.
                </p>
                {invitationError && (
                  <div style={{ color: "#b71c1c", marginBottom: "1rem" }}>
                    {invitationError}
                  </div>
                )}
                <button
                  onClick={handleCreateInvitation}
                  disabled={creatingInvitation}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    background: "#1976d2",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {creatingInvitation ? "Generando..." : "Generar link"}
                </button>
              </div>
            ) : (
              <div>
                <p style={{ color: "#1b5e20", marginBottom: "1rem" }}>
                  ✓ Link generado correctamente
                </p>
                <div
                  style={{
                    background: "#f5f5f5",
                    padding: "0.75rem",
                    borderRadius: "4px",
                    marginBottom: "1rem",
                    wordBreak: "break-all",
                    fontSize: "0.875rem",
                  }}
                >
                  {`${window.location.origin}/invite/${generatedToken}`}
                </div>
                <button
                  onClick={copyToClipboard}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    background: "#4caf50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginBottom: "0.5rem",
                  }}
                >
                  Copiar link
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setShowInvitationModal(false);
                setGeneratedToken("");
                setInvitationError("");
              }}
              style={{
                width: "100%",
                padding: "0.5rem",
                background: "#ccc",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <section style={{ marginBottom: "2rem" }}>
        <h2>Miembros</h2>
        {memberRoleError && (
          <div style={{ color: "#b71c1c", marginBottom: "1rem" }}>
            {memberRoleError}
          </div>
        )}
        {members?.length === 0 ? (
          <p>No hay miembros en este grupo.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {members.map((member) => (
              <li
                key={member.id}
                style={{
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  marginBottom: "0.5rem",
                }}
              >
                <strong>
                  {member.first_name} {member.last_name}
                </strong>
                <div style={{ color: "#666" }}>{member.email}</div>
                <div
                  style={{
                    marginTop: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>Rol:</div>
                  {isAdmin ? (
                    <select
                      value={member.role}
                      onChange={(event) =>
                        handleChangeMemberRole(member.id, event.target.value)
                      }
                      disabled={updatingMemberId === member.id}
                      style={{ padding: "0.4rem", borderRadius: "4px" }}
                    >
                      <option value="admin">admin</option>
                      <option value="member">member</option>
                    </select>
                  ) : (
                    <span>{member.role}</span>
                  )}
                  {isAdmin && member.id !== currentUserData?.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setRemoveError("");
                        setMemberToRemove(member);
                      }}
                      style={{
                        padding: "0.4rem 0.75rem",
                        background: "#d32f2f",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Expulsar
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Crear gasto</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Descripción
            </label>
            <input
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Importe
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={totalAmount}
              onChange={(event) => setTotalAmount(event.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Pagado por
            </label>
            <select
              value={selectedPaidBy}
              onChange={(event) => setPaidBy(event.target.value)}
              style={{ width: "100%", padding: "0.5rem" }}
            >
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.first_name} {member.last_name}
                </option>
              ))}
            </select>
          </div>
          {formError && (
            <div style={{ color: "#b71c1c", marginBottom: "1rem" }}>
              {formError}
            </div>
          )}
          <button type="submit" disabled={creatingExpense}>
            {creatingExpense ? "Creando..." : "Crear gasto"}
          </button>
        </form>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Liquidación sugerida</h2>
        {loadingSettlements ? (
          <p>Cargando liquidación...</p>
        ) : settlementsError ? (
          <p>No se pudo calcular la liquidación.</p>
        ) : !settlements || settlements.length === 0 ? (
          <p style={{ color: "#666" }}>No hay transferencias necesarias.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {settlements.map((s, idx) => (
              <li
                key={`${s.from_user_id}-${s.to_user_id}-${idx}`}
                style={{
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  marginBottom: "0.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>
                    {s.from_name} → {s.to_name}
                  </strong>
                  <div style={{ color: "#666" }}>
                    {formatCurrency(s.amount, group.currency)}
                  </div>
                </div>
                <div>
                  <button
                    style={{
                      padding: "0.4rem 0.75rem",
                      background: creatingSettlement ? "#90caf9" : "#1976d2",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: creatingSettlement ? "not-allowed" : "pointer",
                    }}
                    onClick={() => {
                      createSettlement(
                        {
                          from_user_id: s.from_user_id,
                          to_user_id: s.to_user_id,
                          amount: s.amount,
                        },
                        {
                          onSuccess: () => {
                            alert("Pago registrado");
                          },
                          onError: (err) => {
                            alert(
                              err.response?.data?.error ||
                                err.message ||
                                "No se pudo registrar el pago",
                            );
                          },
                        },
                      );
                    }}
                    disabled={creatingSettlement}
                  >
                    {creatingSettlement ? "Marcando..." : "Marcar pagado"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Balances</h2>
        {balances?.length === 0 ? (
          <p>No hay balances disponibles.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {balances.map((balance) => {
              const name = memberNamesById?.[balance.id] || balance.id;
              const value = Number(balance.balance);

              return (
                <li
                  key={balance.id}
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    marginBottom: "0.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{name}</span>
                  <span
                    style={{
                      color: value >= 0 ? "#1b5e20" : "#b71c1c",
                      fontWeight: "bold",
                    }}
                  >
                    {formatCurrency(value, group.currency)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2>Gastos</h2>
        {expenses?.length === 0 ? (
          <p>No hay gastos registrados aún en este grupo.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {expenses.map((expense) => (
              <li
                key={expense.id}
                style={{
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  marginBottom: "0.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>{expense.description}</span>
                    <strong>
                      {formatCurrency(expense.total_amount, group.currency)}
                    </strong>
                  </div>
                  <div style={{ color: "#666", marginTop: "0.25rem" }}>
                    Pagado por:{" "}
                    {memberNamesById?.[expense.paid_by] || expense.paid_by}
                  </div>
                </div>
                <div
                  style={{
                    marginLeft: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <button
                    onClick={() => startEditExpense(expense)}
                    style={{
                      padding: "0.5rem",
                      background: "#1976d2",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() =>
                      setDeleteConfirm({
                        expenseId: expense.id,
                        description: expense.description,
                      })
                    }
                    style={{
                      padding: "0.5rem",
                      background: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Modal de edición de gasto */}
      {editingExpense && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setEditingExpense(null)}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "8px",
              width: "400px",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <h2>Editar gasto</h2>
            <form onSubmit={handleUpdateExpense}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Descripción
                </label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  required
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Importe
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editTotalAmount}
                  onChange={(event) => setEditTotalAmount(event.target.value)}
                  required
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Pagado por
                </label>
                <select
                  value={editPaidBy}
                  onChange={(event) => setEditPaidBy(event.target.value)}
                  style={{ width: "100%", padding: "0.5rem" }}
                >
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.first_name} {member.last_name}
                    </option>
                  ))}
                </select>
              </div>
              {editError && (
                <div style={{ color: "#b71c1c", marginBottom: "1rem" }}>
                  {editError}
                </div>
              )}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "#ccc",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updatingExpense}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "#1976d2",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {updatingExpense ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h2>Confirmar eliminación</h2>
            <p style={{ color: "#666" }}>
              ¿Estás seguro de que deseas eliminar el gasto{" "}
              <strong>{deleteConfirm.description}</strong>?
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  background: "#ccc",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteExpense(deleteConfirm.expenseId)}
                disabled={deletingExpense}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  background: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {deletingExpense ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
