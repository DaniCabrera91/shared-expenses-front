import { api } from "./client";

export const notificationsApi = {
  getGroupNotifications: (groupId, limit = 20) =>
    api.get(`/groups/${groupId}/notifications`, { params: { limit } }),
};
