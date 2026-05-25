import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data) => authApi.register(data),

    onSuccess: (_, variables) => {
      if (variables.fromInvite && variables.invitationToken) {
        navigate("/login", {
          state: {
            fromInvite: true,
            token: variables.invitationToken,
          },
          replace: true,
        });
      } else {
        navigate("/login", { replace: true });
      }
    },
  });
};
