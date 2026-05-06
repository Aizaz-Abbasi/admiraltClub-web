import { apiPost } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { AuthApiResponse, AuthRequestPayload } from './types';

export async function loginApi(payload: AuthRequestPayload) {
  return apiPost<AuthApiResponse, AuthRequestPayload>(API_ENDPOINTS.auth.login, payload);
}

export async function signupApi(payload: AuthRequestPayload) {
  return apiPost<AuthApiResponse, AuthRequestPayload>(API_ENDPOINTS.auth.signup, payload);
}

export async function forgotPasswordApi(email: string) {
  return apiPost<{ message: string }>('auth/forgot-password', { email });
}

export async function resetPasswordApi(token: string, password: string) {
  return apiPost<{ message: string }>('auth/reset-password', { token, password });
}
