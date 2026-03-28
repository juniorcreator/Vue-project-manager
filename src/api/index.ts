import axios from "axios";
import toast from "vue3-hot-toast";

const api = axios.create({
  baseURL: "https://69c3d544b780a9ba03e81187.mockapi.io/api",
  headers: { "Content-Type": "application/json" },
  timeout: 600,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status !== 404) {
      console.error("API Error:", error);
    }
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      console.error("API Timeout:", error.message);
      toast.error("Server Error, Please Update the page");
    }
    return Promise.reject(error);
  },
);

export default api;
