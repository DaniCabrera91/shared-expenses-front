import { api } from "./client";

export const expensesApi = {
  // Resumen global del usuario
  getSummary: () => api.get("/expenses/summary"),

  // Gastos de un grupo
  getByGroup: (groupId) => api.get(`/expenses/groups/${groupId}/expenses`),

  // Crear gasto en grupo
  create: (groupId, data) =>
    api.post(`/expenses/groups/${groupId}/expenses`, data),

  // Eliminar gasto
  delete: (expenseId) => api.delete(`/expenses/${expenseId}`),

  // Actualizar gasto
  update: (expenseId, data) => api.put(`/expenses/${expenseId}`, data),

  // Balances de un grupo
  getBalances: (groupId) => api.get(`/expenses/groups/${groupId}/balances`),
  // Sugerencias de liquidación minimal entre miembros
  getSettlements: (groupId) =>
    api.get(`/expenses/groups/${groupId}/settlements`),
  // Crear un settlement (marcar pagado)
  createSettlement: (groupId, payload) =>
    api.post(`/expenses/groups/${groupId}/settlements`, payload),
};
