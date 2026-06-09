import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/users/me"),
    select: (res) => res.data.user,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};

export default useCurrentUser;
