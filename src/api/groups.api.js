import { api } from "./client";

export const groupsApi = {
  getAll: () => api.get("/groups"),

  getById: (id) => api.get(`/groups/${id}`),

  create: (data) => api.post("/groups", data),

  update: (id, data) => api.put(`/groups/${id}`, data),

  delete: (id) => api.delete(`/groups/${id}`),

  // Miembros
  getMembers: (id) => api.get(`/groups/${id}/members`),

  addMember: (groupId, userId) =>
    api.post(`/groups/${groupId}/members`, { userId }),

  updateMemberRole: (groupId, userId, role) =>
    api.patch(`/groups/${groupId}/members/${userId}/role`, { role }),

  removeMember: (groupId, userId) =>
    api.delete(`/groups/${groupId}/members/${userId}`),

  // Gastos del grupo
  getExpenses: (id) => api.get(`/groups/${id}/expenses`),
};
