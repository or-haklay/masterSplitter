import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `${localStorage.getItem('token')}`,
    },
});


api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `${token}`;
    }
    return config;
});

function setDefaultCommonHeaders(key, value) {
  api.defaults.headers.common[key] = value;
}

const httpServices = {
    setDefaultCommonHeaders,
    get: (url) => api.get(url),
    post: (url, data) => api.post(url, data),
    put: (url, data) => api.put(url, data),
    delete: (url) => api.delete(url),
};

export default httpServices;