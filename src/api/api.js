// .../../.../api.js
import axios from "axios";
export const api = axios.create({
    baseURL: `${import.meta.env.VITE_BACK_END_URL}/api/k8s`,
});

export const coreApi = axios.create({
    baseURL: `${import.meta.env.VITE_BACK_END_URL}/api`,
});

