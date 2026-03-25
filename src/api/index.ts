import axios from "axios";

const api = axios.create({
  baseURL: "https://69c3d544b780a9ba03e81187.mockapi.io/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(error, " Api Error");
    return Promise.reject(error);
  },
);

export default api;
