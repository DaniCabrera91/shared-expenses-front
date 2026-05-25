import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginRequest } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const response = await loginRequest({
        email: formData.email,
        password: formData.password,
      });

      return {
        response,
        fromInvite: formData.fromInvite,
        invitationToken: formData.invitationToken,
      };
    },

    onSuccess: ({ response, fromInvite, invitationToken }) => {
      localStorage.setItem("token", response.token);

      // Refetch current user data to ensure `me` is up-to-date
      queryClient.invalidateQueries(["me"]);

      if (fromInvite && invitationToken) {
        navigate(`/invite/${invitationToken}`, {
          state: {
            fromInvite: true,
            token: invitationToken,
          },
          replace: true,
        });
      } else {
        navigate("/", { replace: true });
      }
    },
  });
};
