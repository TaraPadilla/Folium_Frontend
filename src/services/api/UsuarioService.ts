import { BaseApiService } from './BaseApiService';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  created_at: string;
  updated_at: string;
}

export class UsuarioService extends BaseApiService {
  private endpoint = '/usuarios';

  async getAll(): Promise<Usuario[]> {
    const response = await this.get<Usuario[]>(this.endpoint);
    return response;
  }

  async getById(id: number): Promise<Usuario> {
    const response = await this.get<Usuario>(`${this.endpoint}/${id}`);
    return response;
  }

  async create(usuario: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>): Promise<Usuario> {
    const response = await this.post<Usuario>(this.endpoint, usuario);
    return response;
  }

  async update(id: number, usuario: Partial<Usuario>): Promise<Usuario> {
    const response = await this.put<Usuario>(`${this.endpoint}/${id}`, usuario);
    return response;
  }

  async remove(id: number): Promise<void> {
    await this.delete<void>(`${this.endpoint}/${id}`);
  }
}
