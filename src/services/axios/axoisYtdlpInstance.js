import axios from 'axios';

const axiosInterceptorInstance = axios.create({
    baseURL: 'http://192.168.1.141:3033/',
    withCredentials: false
});

// Add token from storage if present
axiosInterceptorInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('yt-dlp') || sessionStorage.getItem('yt-dlp');
    if (token) {
        config.headers['x-authentication'] = token;
    }
    return config;
});

export default axiosInterceptorInstance;
