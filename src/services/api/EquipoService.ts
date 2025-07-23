import { BaseApiService } from './BaseApiService';

export interface UserEncargado {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  equipo_id: number | null;
}

export interface Equipo {
  id: number;
  nombre: string;
  id_user_encargado: number;
  user_encargado: UserEncargado;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export class EquipoService extends BaseApiService {
  private endpoint = '/equipos';

  async getAll(): Promise<Equipo[]> {
    return this.get<Equipo[]>(this.endpoint);
  }

  async getById(id: number): Promise<Equipo> {
    const response = await this.get<{ data: Equipo }>(`${this.endpoint}/${id}`);
    return response.data;
  }

  async create(equipo: Omit<Equipo, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'user_encargado'>): Promise<Equipo> {
    const response = await this.post<{ data: Equipo }>(this.endpoint, equipo);
    return response.data;
  }

  async update(id: number, equipo: Partial<Omit<Equipo, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'user_encargado'>>): Promise<Equipo> {
    const response = await this.put<{ data: Equipo }>(`${this.endpoint}/${id}`, equipo);
    return response.data;
  }

  async remove(id: number): Promise<void> {
    await this.delete<void>(`${this.endpoint}/${id}`);
  }
}
