import { api } from "./client";

export const groupsApi = {
  getAll: (params = {}) => api.get("/groups", { params }),

  getById: (id) => api.get(`/groups/${id}`),

  create: (data) => api.post("/groups", data),

  update: (id, data) => api.put(`/groups/${id}`, data),

  archive: (id) => api.patch(`/groups/${id}/archive`),

  unarchive: (id) => api.patch(`/groups/${id}/unarchive`),

  leave: (id) => api.delete(`/groups/${id}/leave`),

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
