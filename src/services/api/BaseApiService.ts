import axios, { AxiosInstance } from 'axios';

export class BaseApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_BACKEND_URL;
    console.log(this.baseURL);
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );  
  }

  protected async get<T>(endpoint: string): Promise<T> {
    const { data } = await this.api.get(endpoint);
    return data.data as T;
  }

  protected async post<T>(endpoint: string, body: any): Promise<T> {
    const { data } = await this.api.post(endpoint, body);
    return data.data as T;
  }

  protected async put<T>(endpoint: string, body: any): Promise<T> {
    const { data } = await this.api.put(endpoint, body);
    return data.data as T;
  }

  protected async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const { data } = await this.api.post(endpoint, formData, {
      headers: {
        'Content-Type': undefined
      }
    });
    return data.data as T;
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    const { data } = await this.api.delete(endpoint);
    return data.data as T;
  }

  private handleError(error: any): void {
    console.error('API Error:', error.response.data);
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
}
