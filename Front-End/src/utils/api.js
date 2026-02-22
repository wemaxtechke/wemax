import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

/** Use for multipart/form-data (e.g. product create/update with images). Do not set Content-Type. */
export function apiFormData() {
    const token = localStorage.getItem('token');
    return axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        // Leave Content-Type unset so browser sets multipart/form-data with boundary
    });
}

export default api;
