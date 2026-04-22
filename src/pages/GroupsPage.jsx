import { useState } from "react";
import { useGroups } from "../features/groups/useGroups";
import { useCreateGroup } from "../features/groups/useCreateGroup";

export default function GroupsPage() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: groups, isLoading, error } = useGroups();
  const { mutate, isPending } = useCreateGroup();

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(
      { name, description },
      {
        onSuccess: () => {
          setShowForm(false);
          setName("");
          setDescription("");
        },
      },
    );
  };

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
        <button onClick={() => setShowForm(true)}>Crear grupo</button>
      </div>

      {/* Modal crear grupo */}
      {showForm && (
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
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h2>Crear Grupo</h2>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: "100%", padding: "0.5rem", minHeight: "80px" }}
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="submit" disabled={isPending}>
                {isPending ? "Creando..." : "Crear"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ background: "#ccc" }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

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
