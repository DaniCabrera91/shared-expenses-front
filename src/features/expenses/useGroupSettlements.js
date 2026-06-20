import { useQuery } from "@tanstack/react-query";
import { expensesApi } from "../../api/expenses.api";

export const useGroupSettlements = (groupId) => {
  return useQuery({
    queryKey: ["groupSettlements", groupId],
    queryFn: () => expensesApi.getSettlements(groupId),
    select: (res) => res.data,
    enabled: Boolean(groupId),
  });
};

export default useGroupSettlements;
