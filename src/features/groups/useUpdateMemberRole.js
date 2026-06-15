import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "../../api/groups.api";

export const useUpdateMemberRole = (groupId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }) => {
      const members = queryClient.getQueryData(["groupMembers", groupId]) || [];
      const adminCount = members.filter((m) => m.role === "admin").length;
      const target = members.find((m) => m.id === userId);

      if (
        target &&
        target.role === "admin" &&
        role === "member" &&
        adminCount === 1
      ) {
        const err = new Error(
          "No se puede demotar al último administrador. Asigna otro admin antes.",
        );
        err.isClientBlocked = true;
        throw err;
      }

      return groupsApi.updateMemberRole(groupId, userId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["groupMembers", groupId]);
    },
  });
};
