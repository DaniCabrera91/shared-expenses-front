import { useQuery } from "@tanstack/react-query";
import { groupsApi } from "../../api/groups.api";

export const useGroupMembers = (groupId) => {
  return useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: () => groupsApi.getMembers(groupId),
    select: (res) => res.data,
    enabled: Boolean(groupId),
  });
};
