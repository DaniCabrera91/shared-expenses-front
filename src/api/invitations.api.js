import { api } from "./client";

export const invitationsApi = {
  // Crear invitación (solo admin)
  create: (groupId, expiresIn) =>
    api.post(`/groups/${groupId}/invitations`, { expiresIn }),

  // Validar token (público)
  validate: (token) => api.get(`/invitations/${token}`),

  // Unirse a grupo con token
  join: (token) => api.post(`/invitations/join`, { token }),
};
