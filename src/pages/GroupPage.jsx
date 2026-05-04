import { Link, useParams } from "react-router-dom";
import { useGroup } from "../features/groups/useGroup";
import { useGroupMembers } from "../features/groups/useGroupMembers";
import { useGroupExpenses } from "../features/expenses/useGroupExpenses";

export default function GroupPage() {
  const { groupId } = useParams();
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

  if (loadingGroup || loadingMembers || loadingExpenses) {
    return <div>Cargando grupo...</div>;
  }

  if (groupError || membersError || expensesError) {
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
      </div>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Miembros</h2>
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
                <div style={{ marginTop: "0.25rem" }}>Rol: {member.role}</div>
              </li>
            ))}
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
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>{expense.description}</span>
                  <strong>{formatCurrency(expense.total_amount)}</strong>
                </div>
                <div style={{ color: "#666", marginTop: "0.25rem" }}>
                  Pagado por: {expense.paid_by}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
