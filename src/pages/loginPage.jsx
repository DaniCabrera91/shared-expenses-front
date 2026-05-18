import { useForm } from "react-hook-form";
import { useLogin } from "../features/auth/useLogin";
import { Navigate, useLocation } from "react-router-dom";

export default function LoginPage() {
  const location = useLocation();

  const fromInvite = location.state?.fromInvite;
  const invitationToken = location.state?.token;

  const token = localStorage.getItem("token");

  if (token && !fromInvite) {
    return <Navigate to="/" replace />;
  }

  const { register, handleSubmit } = useForm();

  const { mutate, isPending, isError } = useLogin();

  const onSubmit = (data) => {
    mutate({
      ...data,
      fromInvite,
      invitationToken,
    });
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem" }}>
      <h1>Iniciar sesión</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="email"
          placeholder="Email"
          {...register("email", { required: true })}
        />

        <input
          type="password"
          placeholder="Contraseña"
          {...register("password", { required: true })}
        />

        <button type="submit" disabled={isPending}>
          {isPending ? "Iniciando..." : "Iniciar sesión"}
        </button>

        {isError && (
          <div style={{ color: "red" }}>Email o contraseña incorrectos</div>
        )}
      </form>
    </div>
  );
}
