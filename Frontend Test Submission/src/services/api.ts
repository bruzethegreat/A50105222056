import axios, { AxiosResponse } from 'axios';
import { CreateUrlRequest, ShortUrlResponse, UrlStatsResponse, ApiError } from '../types';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(`Making API request to ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API response received: ${response.status} ${response.statusText}`);
    return response;
  },
  (error) => {
    console.error('Response interceptor error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export class ApiService {
  static async createShortUrl(data: CreateUrlRequest): Promise<ShortUrlResponse> {
    try {
      const response = await api.post<ShortUrlResponse>('/shorturls', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ApiError;
      }
      throw { error: 'Network Error', message: 'Failed to connect to server' } as ApiError;
    }
  }

  static async getUrlStats(shortcode: string): Promise<UrlStatsResponse> {
    try {
      const response = await api.get<UrlStatsResponse>(`/shorturls/${shortcode}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ApiError;
      }
      throw { error: 'Network Error', message: 'Failed to connect to server' } as ApiError;
    }
  }

  static async getAllUrlStats(): Promise<UrlStatsResponse[]> {
    try {
      const response = await api.get<UrlStatsResponse[]>('/shorturls');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ApiError;
      }
      throw { error: 'Network Error', message: 'Failed to connect to server' } as ApiError;
    }
  }

  static async checkBackendHealth(): Promise<boolean> {
    try {
      await api.get('/health');
      return true;
    } catch (error) {
      console.warn('Backend health check failed:', error);
      return false;
    }
  }
}