import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../api/auth.api";

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ current_password, new_password }) =>
      authApi.changePassword({ current_password, new_password }),
  });
};

export default useChangePassword;
