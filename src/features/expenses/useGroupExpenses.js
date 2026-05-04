import { useQuery } from "@tanstack/react-query";
import { expensesApi } from "../../api/expenses.api";

export const useGroupExpenses = (groupId) => {
  return useQuery({
    queryKey: ["groupExpenses", groupId],
    queryFn: () => expensesApi.getByGroup(groupId),
    select: (res) => res.data,
    enabled: Boolean(groupId),
  });
};
