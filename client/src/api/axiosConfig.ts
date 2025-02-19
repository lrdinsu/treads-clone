import axios, { AxiosError } from 'axios';

import { useAuthStore } from '@/stores/authStore.ts';
import { refreshAccessToken } from '@/utils/refreshAccessToken.ts';

export type ApiErrorResponse = {
  message: string;
};

export type AuthResponse = {
  accessToken: string;
  userId: number;
  username: string;
  profilePic: string | null;
};

// Create an Axios instance
const API_PREFIX = import.meta.env.VITE_API_PREFIX as string;

export const axiosInstance = axios.create({
  baseURL: API_PREFIX,
  withCredentials: true, // Include HTTP-only cookie in requests
});

// Add the access token to the request headers
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh-token') &&
      !originalRequest.url?.includes('/auth/signup')
    ) {
      originalRequest._retry = true;

      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);
