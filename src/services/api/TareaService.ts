import { BaseApiService } from './BaseApiService';

export interface Tarea {
  id: number;
  nombre: string;
  plan_id: number;
  tipo: string;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export class TareaService extends BaseApiService {
  private endpoint = '/tareas';

  async getAll(): Promise<Tarea[]> {
    return this.get<Tarea[]>(this.endpoint);
  }

  async getById(id: number): Promise<Tarea> {
    return this.get<Tarea>(`${this.endpoint}/${id}`);
  }

  async create(tarea: Omit<Tarea, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Tarea> {
    return this.post<Tarea>(this.endpoint, tarea);
  }

  async update(id: number, tarea: Partial<Omit<Tarea, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<Tarea> {
    return this.put<Tarea>(`${this.endpoint}/${id}`, tarea);
  }

  async remove(id: number): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
