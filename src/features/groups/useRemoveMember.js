import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "../../api/groups.api";

export const useRemoveMember = (groupId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => groupsApi.removeMember(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["groupMembers", groupId]);
    },
  });
};

export default useRemoveMember;
