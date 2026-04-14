import { useForm } from "react-hook-form";
import { useLogin } from "../features/auth/useLogin";

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const { mutate, isLoading, isError } = useLogin();

  const onSubmit = (data) => {
    mutate(data);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Login</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: true })}
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            {...register("password", { required: true })}
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Login"}
        </button>

        {isError && <p>Error al iniciar sesión</p>}
      </form>
    </div>
  );
}
