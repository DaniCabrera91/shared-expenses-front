import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../api/auth.api";

export const useRegister = () => {
  return useMutation({
    mutationFn: (data) => authApi.register(data),
    onSuccess: (response) => {
      // El registro fue exitoso pero no devuelve token
      // El usuario debe iniciar sesión después
      console.log("Usuario registrado:", response.data);
    },
  });
};
