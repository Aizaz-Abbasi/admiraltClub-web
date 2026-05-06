import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { queryClient } from '../lib/queryClient';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:5000/api/';
export const AUTH_TOKEN_STORAGE_KEY = 'admiralty.auth.token';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// src/lib/api.ts

// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//       if (axios.isAxiosError(error) && error.response?.status === 401) {
//           useAuthStore.getState().logout(); // ✅ call store directly, no hook needed
//       }
//       return Promise.reject(error);
//   }
// );

// src/api/client.ts


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // mirrors your clearStoredUser() + logout logic
      localStorage.removeItem('admiralty.auth.user');
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      queryClient.setQueryData(['auth', 'user'], null);
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const messageFromResponse =
      (error.response?.data as { message?: string } | undefined)?.message ||
      (error.response?.data as { error?: string } | undefined)?.error;

    if (messageFromResponse) {
      return messageFromResponse;
    }

    if (error.message) {
      return error.message;
    }
  }

  return 'Something went wrong. Please try again.';
}

export async function apiGet<TResponse>(
  url: string,
  config?: AxiosRequestConfig
): Promise<TResponse> {
  const response = await apiClient.get<TResponse>(url, config);
  return response.data;
}

export async function apiPost<TResponse, TPayload = unknown>(
  url: string,
  payload?: TPayload,
  config?: AxiosRequestConfig
): Promise<TResponse> {
  const response = await apiClient.post<TResponse>(url, payload, config);
  return response.data;
}

export async function apiPatch<TResponse, TPayload = unknown>(
  url: string,
  payload?: TPayload,
  config?: AxiosRequestConfig
): Promise<TResponse> {
  const response = await apiClient.patch<TResponse>(url, payload, config);
  return response.data;
}

export const apiPostForm = <T>(endpoint: string, form: FormData): Promise<T> =>
  apiClient
    .post<T>(endpoint, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);

export async function apiDelete<TResponse>(
  url: string,
  config?: AxiosRequestConfig
): Promise<TResponse> {
  const response = await apiClient.delete<TResponse>(url, config);
  return response.data;
}
