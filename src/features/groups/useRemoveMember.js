import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "../../api/groups.api";

export const useRemoveMember = (groupId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      const members = queryClient.getQueryData(["groupMembers", groupId]) || [];
      const adminCount = members.filter((m) => m.role === "admin").length;
      const target = members.find((m) => m.id === userId);

      if (target && target.role === "admin" && adminCount === 1) {
        const err = new Error(
          "No se puede eliminar al último administrador. Asigna otro admin antes.",
        );
        err.isClientBlocked = true;
        throw err;
      }

      return groupsApi.removeMember(groupId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["groupMembers", groupId]);
    },
  });
};

export default useRemoveMember;
