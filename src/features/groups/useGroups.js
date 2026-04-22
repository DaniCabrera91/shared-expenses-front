import { useQuery } from "@tanstack/react-query";
import { groupsApi } from "../../api/groups.api";

export const useGroups = () => {
  return useQuery({
    queryKey: ["groups"],
    queryFn: () => groupsApi.getAll(),
    select: (res) => res.data,
  });
};
