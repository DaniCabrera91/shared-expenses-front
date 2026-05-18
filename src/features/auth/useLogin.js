import { useMutation } from "@tanstack/react-query";
import { loginRequest } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const navigate = useNavigate();

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

      if (fromInvite && invitationToken) {
        navigate(`/invite/${invitationToken}`, {
          state: {
            fromInvite: true,
          },
        });
      } else {
        navigate("/");
      }
    },
  });
};
