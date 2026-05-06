import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "../../api/groups.api";

export const useUpdateMemberRole = (groupId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }) =>
      groupsApi.updateMemberRole(groupId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries(["groupMembers", groupId]);
    },
  });
};
