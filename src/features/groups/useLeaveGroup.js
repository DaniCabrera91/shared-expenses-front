import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "../../api/groups.api";

export const useLeaveGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupsApi.leave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["groups", "archived"] });
    },
  });
};

export default useLeaveGroup;
