import axios from 'axios';
import Cookies from 'js-cookie';

// Axios instance
export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? 'http://localhost:3000/api' : '/api',
    withCredentials: true,
    timeout: 60000, // 60 seconds
});

// Request interceptor to handle csrf token
axiosInstance.interceptors.request.use((config) => {
    if (config.method !== 'get') {
        const csrfToken = Cookies.get('XSRF-TOKEN');
        if (csrfToken) {
            config.headers['X-XSRF-TOKEN'] = csrfToken;
        }
    }
    return config;
}, (error) => Promise.reject(error));

// Response interceptor to refresh the access token on 401 errors
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Check if the error is a user cancellation
        if (axios.isCancel && axios.isCancel(error)) {
            return Promise.reject(error);
        }

        const originalRequest = error.config;

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry && error.response?.data?.message?.includes('no token provided')) {
            originalRequest._retry = true;

            try {
                // Request a new access token
                const endpoint = import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api";
                await axios.post(`${endpoint}/auth/refresh-token`, {}, { withCredentials: true });

                // Retry the original request
                return axiosInstance(originalRequest);
            } catch (err) {
                // Clear cookies and redirect to login
                if (err?.response?.status === 401) {
                  Cookies.remove("accessToken");
                  Cookies.remove("refreshToken", { path: "/api/auth/refresh-token" });
                  Cookies.remove("theme");
                  localStorage.clear();
                  window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);
