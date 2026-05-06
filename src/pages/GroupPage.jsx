import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { useGroup } from "../features/groups/useGroup";
import { useGroupMembers } from "../features/groups/useGroupMembers";
import { useUpdateMemberRole } from "../features/groups/useUpdateMemberRole";
import { useGroupExpenses } from "../features/expenses/useGroupExpenses";
import { useGroupBalances } from "../features/expenses/useGroupBalances";
import { useCreateExpense } from "../features/expenses/useCreateExpense";
import { useDeleteExpense } from "../features/expenses/useDeleteExpense";
import { useUpdateExpense } from "../features/expenses/useUpdateExpense";
import { useCreateInvitation } from "../features/invitations/useInvitations";

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

  // Obtener usuario actual para verificar si es admin
  const { data: currentUserData, isLoading: loadingUser } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/users/me"),
    select: (res) => res.data.user,
    retry: false,
  });

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

  const { mutate, isLoading: creatingExpense } = useCreateExpense(groupId);
  const { mutate: createInvitation, isLoading: creatingInvitation } =
    useCreateInvitation(groupId);
  const { mutate: deleteExpense, isLoading: deletingExpense } =
    useDeleteExpense(groupId);
  const { mutate: updateExpense, isLoading: updatingExpense } =
    useUpdateExpense(groupId);
  const { mutate: updateMemberRole, isLoading: updatingMemberRole } =
    useUpdateMemberRole(groupId);

  const [updatingMemberId, setUpdatingMemberId] = useState(null);
  const [memberRoleError, setMemberRoleError] = useState("");

  // Debug: log de currentUserData y members
  if (currentUserData && members) {
    console.log("currentUserData:", currentUserData);
    console.log("members:", members);
  }

  // Verificar si el usuario actual es admin
  const isAdmin =
    currentUserData &&
    members?.some((m) => m.id === currentUserData.id && m.role === "admin");

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: group.currency || "EUR",
    }).format(amount);
  };

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
        {isAdmin && (
          <button
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
        )}
      </div>

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
                    {formatCurrency(value)}
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
                    <strong>{formatCurrency(expense.total_amount)}</strong>
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
