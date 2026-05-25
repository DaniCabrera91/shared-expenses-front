import { api } from "./client";

export const authApi = {
  register: (data) => api.post("/auth/register", data),

  login: (credentials) => api.post("/auth/login", credentials),

  refresh: () => api.post("/auth/refresh"),
  logout: () => api.post("/auth/logout"),
  changePassword: (data) => api.patch("/auth/password", data),
};

export const loginRequest = async (credentials) => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

export const refreshRequest = async () => {
  const { data } = await api.post("/auth/refresh");
  return data;
};
