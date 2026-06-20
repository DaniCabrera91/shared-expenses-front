import { useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesApi } from "../../api/expenses.api";

export const useCreateSettlement = (groupId) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload) => expensesApi.createSettlement(groupId, payload),
    onSuccess: () => {
      qc.invalidateQueries(["groupBalances", groupId]);
      qc.invalidateQueries(["groupSettlements", groupId]);
      qc.invalidateQueries(["groupExpenses", groupId]);
    },
  });
};

export default useCreateSettlement;
