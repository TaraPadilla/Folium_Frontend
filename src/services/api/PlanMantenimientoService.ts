import { BaseApiService } from './BaseApiService';

export interface PlanMantenimiento {
  id: number;
  nombre: string;
  descripcion: string;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export class PlanMantenimientoService extends BaseApiService {
  private endpoint = '/planes_mantenimiento';

  async getAll(): Promise<PlanMantenimiento[]> {
    return this.get<PlanMantenimiento[]>(this.endpoint);
  }

  async getById(id: number): Promise<PlanMantenimiento> {
    return this.get<PlanMantenimiento>(`${this.endpoint}/${id}`);
  }

  async create(plan: Omit<PlanMantenimiento, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<PlanMantenimiento> {
    return this.post<PlanMantenimiento>(this.endpoint, plan);
  }

  async update(id: number, plan: Partial<Omit<PlanMantenimiento, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<PlanMantenimiento> {
    return this.put<PlanMantenimiento>(`${this.endpoint}/${id}`, plan);
  }

  async remove(id: number): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
