import { useForm } from "react-hook-form";
import { useRegister } from "../features/auth/useRegister";
import { Navigate, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // 🔐 si ya está logueado → fuera de aquí
  if (token) {
    return <Navigate to="/" replace />;
  }

  const { register, handleSubmit, watch } = useForm();
  const { mutate, isLoading, isError, error } = useRegister();
  const password = watch("password");

  const onSubmit = (data) => {
    if (data.password !== data.passwordConfirm) {
      return;
    }

    mutate(
      {
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        alias: data.alias || data.email.split("@")[0],
      },
      {
        onSuccess: () => {
          // Redirigir a login para que inicie sesión
          navigate("/login?registered=true");
        },
      },
    );
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem" }}>
      <h1>Crear cuenta</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Email
          </label>
          <input
            type="email"
            placeholder="tu@email.com"
            {...register("email", { required: "Email requerido" })}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Nombre
          </label>
          <input
            type="text"
            placeholder="Juan"
            {...register("first_name", { required: "Nombre requerido" })}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Apellido
          </label>
          <input
            type="text"
            placeholder="Pérez"
            {...register("last_name", { required: "Apellido requerido" })}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Contraseña
          </label>
          <input
            type="password"
            placeholder="••••••••"
            {...register("password", { required: "Contraseña requerida" })}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Confirmar contraseña
          </label>
          <input
            type="password"
            placeholder="••••••••"
            {...register("passwordConfirm", {
              required: "Confirma tu contraseña",
              validate: (value) =>
                value === password || "Las contraseñas no coinciden",
            })}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {isLoading ? "Registrando..." : "Registrarse"}
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
            {error?.response?.data?.error ||
              error?.message ||
              "Error al registrarse"}
          </div>
        )}

        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <p style={{ color: "#666" }}>
            ¿Ya tienes cuenta?{" "}
            <a
              href="/login"
              style={{ color: "#1976d2", textDecoration: "none" }}
            >
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
