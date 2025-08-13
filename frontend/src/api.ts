import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post("http://localhost:8000/refresh", {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh failed", refreshError);
        window.location.href = "/signin";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
