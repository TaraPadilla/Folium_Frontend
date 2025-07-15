// src/services/AuthService.ts

import { BaseApiService } from './BaseApiService';
import { Usuario } from '@/types';

export interface LoginResponse {
  usuario: Usuario;
  token: string;
}

export class AuthService extends BaseApiService {
  private loginEndpoint = '/login';
  private perfilEndpoint = '/perfil';

  async login(email: string, password: string): Promise<LoginResponse> {
    return this.post<LoginResponse>(this.loginEndpoint, { email, password });
  }

  async getPerfil(): Promise<Usuario> {
    return this.get<Usuario>(this.perfilEndpoint);
  }
}
