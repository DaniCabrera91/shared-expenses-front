import { useQuery } from "@tanstack/react-query";
import { groupsApi } from "../../api/groups.api";

export const useGroups = ({ archived = false } = {}) => {
  return useQuery({
    queryKey: ["groups", archived ? "archived" : "active"],
    queryFn: () => groupsApi.getAll(archived ? { archived: true } : {}),
    select: (res) => res.data,
  });
};
