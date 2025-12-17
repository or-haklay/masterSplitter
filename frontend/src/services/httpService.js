import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.BACKEND_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const httpService = {
    get: (url) => api.get(url),
    post: (url, data) => api.post(url, data),
    put: (url, data) => api.put(url, data),
    delete: (url) => api.delete(url),
};

export default httpService;