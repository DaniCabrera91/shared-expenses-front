import { api } from "./client";

export const authApi = {
  register: (data) => api.post("/auth/register", data),

  login: (credentials) => api.post("/auth/login", credentials),

  refresh: () => api.post("/auth/refresh"),

  logout: (refreshToken) =>
    api.post("/auth/logout", { refresh_token: refreshToken }),
};

export const loginRequest = async (credentials) => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

export const refreshRequest = async () => {
  const { data } = await api.post("/auth/refresh");
  return data;
};
