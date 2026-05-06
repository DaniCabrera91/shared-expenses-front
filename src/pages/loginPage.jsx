import { useForm } from "react-hook-form";
import { useLogin } from "../features/auth/useLogin";
import { Navigate } from "react-router-dom";

export default function LoginPage() {
  const token = localStorage.getItem("token");

  // 🔐 si ya está logueado → fuera de aquí
  if (token) {
    return <Navigate to="/" replace />;
  }

  const { register, handleSubmit } = useForm();
  const { mutate, isLoading, isError } = useLogin();

  const onSubmit = (data) => {
    mutate(data);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem" }}>
      <h1>Iniciar sesión</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: true })}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <input
            type="password"
            placeholder="Contraseña"
            {...register("password", { required: true })}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {isLoading ? "Iniciando..." : "Iniciar sesión"}
        </button>

        {isError && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              background: "#ffebee",
              color: "#b71c1c",
              borderRadius: "4px",
            }}
          >
            Email o contraseña incorrectos
          </div>
        )}

        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <p style={{ color: "#666" }}>
            ¿No tienes cuenta?{" "}
            <a
              href="/register"
              style={{ color: "#4caf50", textDecoration: "none" }}
            >
              Regístrate aquí
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
