import { useQuery } from "@tanstack/react-query";
import { groupsApi } from "../../api/groups.api";

export const useGroup = (groupId) => {
  return useQuery({
    queryKey: ["group", groupId],
    queryFn: () => groupsApi.getById(groupId),
    select: (res) => res.data,
    enabled: Boolean(groupId),
  });
};
