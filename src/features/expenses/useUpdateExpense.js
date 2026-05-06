import { useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesApi } from "../../api/expenses.api";

export const useUpdateExpense = (groupId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ expenseId, data }) => expensesApi.update(expenseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["groupExpenses", groupId]);
      queryClient.invalidateQueries(["groupBalances", groupId]);
    },
  });
};
