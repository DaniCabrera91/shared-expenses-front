import { useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesApi } from "../../api/expenses.api";

export const useDeleteExpense = (groupId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseId) => expensesApi.delete(expenseId),
    onSuccess: () => {
      // Invalidar el cache de gastos del grupo
      queryClient.invalidateQueries(["groupExpenses", groupId]);
      // Invalidar balances también
      queryClient.invalidateQueries(["groupBalances", groupId]);
    },
  });
};
