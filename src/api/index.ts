import axios from "axios";

const api = axios.create({
  baseURL: "https://69c3d544b780a9ba03e81187.mockapi.io/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status !== 404) {
      console.error("API Error:", error);
    }
    return Promise.reject(error);
  },
);

export default api;
