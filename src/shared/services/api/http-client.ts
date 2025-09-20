import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../../../app/config/env';
import type { ApiResponse } from '../../types/index.ts';

// HTTP Client for custom backend
export class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string, apiKey?: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
          if (token && config && config.headers) {
            (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
          }
        } catch (e) {
          // ignore storage errors in non-browser environments
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error?.config as AxiosRequestConfig & { _retry?: boolean } | undefined;

        if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            await this.refreshToken();
            return this.client(originalRequest as any);
          } catch (refreshError) {
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post('/auth/refresh', {
      refreshToken,
    });

    const { accessToken } = response.data;
    localStorage.setItem('authToken', accessToken);
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<T>(url, config);
    return response.data as ApiResponse<T>;
  }

  async post<T, D = Record<string, unknown>>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<T>(url, data as unknown as AxiosRequestConfig, config);
    return response.data as ApiResponse<T>;
  }

  async put<T, D = Record<string, unknown>>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<T>(url, data as unknown as AxiosRequestConfig, config);
    return response.data as ApiResponse<T>;
  }

  async patch<T, D = Record<string, unknown>>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<T>(url, data as unknown as AxiosRequestConfig, config);
    return response.data as ApiResponse<T>;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<T>(url, config);
    return response.data as ApiResponse<T>;
  }
}

// Export configured client for AI microservice
export const aiClient = new HttpClient(
  config.ai.baseUrl,
  config.ai.apiKey
);