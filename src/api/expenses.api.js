import { api } from "./client";

export const expensesApi = {
  // Resumen global del usuario
  getSummary: () => api.get("/expenses/summary"),

  // Gastos de un grupo
  getByGroup: (groupId) => api.get(`/groups/${groupId}/expenses`),

  // Crear gasto en grupo
  create: (groupId, data) => api.post(`/groups/${groupId}/expenses`, data),

  // Eliminar gasto
  delete: (expenseId) => api.delete(`/expenses/${expenseId}`),

  // Balances de un grupo
  getBalances: (groupId) => api.get(`/groups/${groupId}/balances`),
};