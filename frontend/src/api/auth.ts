import { apiClient } from './client';

export interface AuthResponse {
  accessToken: string;
  account: { id: string; email: string };
}

export const authApi = {
  register: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  me: () => apiClient.get<{ id: string; email: string }>('/auth/me').then((r) => r.data),

  changeEmail: (data: { newEmail: string; password: string }) =>
    apiClient.patch<{ email: string }>('/auth/email', data).then((r) => r.data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.patch<{ message: string }>('/auth/password', data).then((r) => r.data),
};
