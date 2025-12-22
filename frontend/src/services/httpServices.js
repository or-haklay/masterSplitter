import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `${localStorage.getItem('token')}`,
    },
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