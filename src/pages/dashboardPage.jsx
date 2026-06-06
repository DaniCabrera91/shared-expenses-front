import { useNavigate } from "react-router-dom";
import { useExpensesSummary } from "../features/expenses/useExpensesSummary";
import { useGroups } from "../features/groups/useGroups";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: summary, isLoading: loadingSummary } = useExpensesSummary();
  const { data: groups, isLoading: loadingGroups } = useGroups();

  if (loadingSummary || loadingGroups) {
    return <div>Cargando...</div>;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Resumen financiero */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            padding: "1.5rem",
            background: "#e8f5e9",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "0.875rem", color: "#666" }}>
            Total pagado
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            {formatCurrency(summary?.total_paid || 0)}
          </div>
        </div>

        <div
          style={{
            padding: "1.5rem",
            background: "#ffebee",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "0.875rem", color: "#666" }}>
            Total pendiente
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            {formatCurrency(summary?.total_owed || 0)}
          </div>
        </div>

        <div
          style={{
            padding: "1.5rem",
            background: summary?.balance >= 0 ? "#e3f2fd" : "#fff3e0",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "0.875rem", color: "#666" }}>Balance</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            {formatCurrency(summary?.balance || 0)}
          </div>
        </div>
      </div>

      {/* Grupos con gastos */}
      <h2>Grupos con actividad</h2>
      {summary?.groups_with_expenses?.length === 0 ? (
        <p>No hay gastos registrados aún.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {summary?.groups_with_expenses?.map((group) => (
            <li
              key={group.id}
              onClick={() => navigate(`/groups/${group.id}`)}
              style={{
                padding: "1rem",
                border: "1px solid #ddd",
                marginBottom: "0.5rem",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f5f5f5";
                e.currentTarget.style.borderColor = "#999";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.borderColor = "#ddd";
              }}
            >
              <span>
                {group.emoji || "💰"} {group.name}
              </span>
              <span style={{ color: "#666" }}>
                {group.expense_count} gasto
                {group.expense_count !== 1 ? "s" : ""}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Todos los grupos del usuario */}
      <h2 style={{ marginTop: "2rem" }}>Mis Grupos</h2>
      {groups?.length === 0 ? (
        <p>No perteneces a ningún grupo.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {groups?.map((group) => (
            <li
              key={group.id}
              onClick={() => navigate(`/groups/${group.id}`)}
              style={{
                padding: "1rem",
                border: "1px solid #ddd",
                marginBottom: "0.5rem",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f5f5f5";
                e.currentTarget.style.borderColor = "#999";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.borderColor = "#ddd";
              }}
            >
              {group.emoji || "💰"} {group.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
