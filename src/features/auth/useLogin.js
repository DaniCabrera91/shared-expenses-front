import { useMutation } from "@tanstack/react-query";
import { loginRequest } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      localStorage.setItem("token", data.accessToken);
      navigate("/");
    },
  });
};
