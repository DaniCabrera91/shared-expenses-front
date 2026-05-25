import { useForm } from "react-hook-form";
import { useChangePassword } from "../features/auth/useChangePassword";
import { Navigate } from "react-router-dom";

export default function AccountPage() {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  const { register, handleSubmit } = useForm();

  const { mutate, isLoading, isError, isSuccess } = useChangePassword();

  const onSubmit = (data) => {
    mutate({ current_password: data.current, new_password: data.new });
  };

  return (
    <div style={{ maxWidth: 480, margin: "2rem auto", padding: "1rem" }}>
      <h1>Cuenta</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="password"
          placeholder="Contraseña actual"
          {...register("current", { required: true })}
        />

        <input
          type="password"
          placeholder="Nueva contraseña"
          {...register("new", { required: true })}
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Actualizando..." : "Actualizar contraseña"}
        </button>

        {isError && <div style={{ color: "red" }}>Error al actualizar</div>}
        {isSuccess && (
          <div style={{ color: "green" }}>Contraseña actualizada</div>
        )}
      </form>
    </div>
  );
}
