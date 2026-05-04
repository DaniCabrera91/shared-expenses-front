import { useQuery } from "@tanstack/react-query";
import { expensesApi } from "../../api/expenses.api";

export const useExpensesSummary = () => {
  return useQuery({
    queryKey: ["expenses", "summary"],
    queryFn: () => expensesApi.getSummary(),
    select: (res) => res.data,
  });
};
