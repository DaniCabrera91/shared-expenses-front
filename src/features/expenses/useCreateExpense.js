import { useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesApi } from "../../api/expenses.api";

export const useCreateExpense = (groupId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => expensesApi.create(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupExpenses", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groupBalances", groupId] });
    },
  });
};
