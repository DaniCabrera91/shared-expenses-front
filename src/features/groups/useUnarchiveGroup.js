import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "../../api/groups.api";

export const useUnarchiveGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupsApi.unarchive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["groups", "archived"] });
    },
  });
};

export default useUnarchiveGroup;
