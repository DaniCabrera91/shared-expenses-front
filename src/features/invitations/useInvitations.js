import { useMutation, useQuery } from "@tanstack/react-query";
import { invitationsApi } from "../../api/invitations.api";

export const useCreateInvitation = (groupId) => {
  return useMutation({
    mutationFn: (expiresIn) => invitationsApi.create(groupId, expiresIn),
  });
};

export const useValidateInvitation = (token) => {
  return useQuery({
    queryKey: ["invitation", token],
    queryFn: () => invitationsApi.validate(token),
    select: (res) => res.data,
    enabled: Boolean(token),
    retry: false,
  });
};

export const useJoinGroup = () => {
  return useMutation({
    mutationFn: (token) => invitationsApi.join(token),
  });
};
