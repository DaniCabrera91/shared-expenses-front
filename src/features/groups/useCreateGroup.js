import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "../../api/groups.api";

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupsApi.create,
    onSuccess: () => {
      // Invalidar cache de grupos para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};
