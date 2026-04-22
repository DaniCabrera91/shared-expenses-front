import { useGroups } from "../features/groups/useGroups";

export default function GroupsPage() {
  const { data: groups, isLoading, error } = useGroups();

  if (isLoading) return <div>Cargando grupos...</div>;
  if (error) return <div>Error al cargar grupos</div>;

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
        <h1>Mis Grupos</h1>
        <button>Crear grupo</button>
      </div>

      {groups?.length === 0 ? (
        <p>No perteneces a ningún grupo</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {groups?.map((group) => (
            <li
              key={group.id}
              style={{
                padding: "1rem",
                border: "1px solid #ddd",
                marginBottom: "0.5rem",
                borderRadius: "8px",
              }}
            >
              <h3>{group.name}</h3>
              <p>{group.description || "Sin descripción"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
