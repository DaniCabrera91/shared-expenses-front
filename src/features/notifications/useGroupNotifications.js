import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "../../api/notifications.api";

export const useGroupNotifications = (groupId) => {
  return useQuery({
    queryKey: ["groupNotifications", groupId],
    queryFn: () => notificationsApi.getGroupNotifications(groupId),
    select: (res) => res.data,
    enabled: Boolean(groupId),
  });
};

export default useGroupNotifications;
