import { useQuery } from "@tanstack/react-query";
import { expensesApi } from "../../api/expenses.api";

export const useGroupBalances = (groupId) => {
  return useQuery({
    queryKey: ["groupBalances", groupId],
    queryFn: () => expensesApi.getBalances(groupId),
    select: (res) => res.data,
    enabled: Boolean(groupId),
  });
};
