// .../api/.../api.js
import axios from "axios";
const api = axios.create({
    baseURL: `${import.meta.env.VITE_BACK_END_URL}/api/k8s`,
});

export default api;