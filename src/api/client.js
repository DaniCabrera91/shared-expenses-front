import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// ---------------- REQUEST ----------------

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ---------------- RESPONSE ----------------

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const token = localStorage.getItem("token");

    // 🚨 si ni siquiera hay token → no intentar refresh
    if (!token) {
      return Promise.reject(error);
    }

    // evitar loops infinitos
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await api.post("/auth/refresh");

        localStorage.setItem("token", data.token);

        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem("token");

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);
