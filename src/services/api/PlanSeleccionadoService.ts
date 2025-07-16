import { BaseApiService } from './BaseApiService';

export interface PlanSeleccionado {
  id: number;
  origen_tipo: string; // e.g., "cotizacion"
  origen_id: number;
  plan_id: number;
  nombre_personalizado: string;
  precio_referencial: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

export class PlanSeleccionadoService extends BaseApiService {
  private endpoint = '/planes_seleccionados';

  async getAll(): Promise<PlanSeleccionado[]> {
    return this.get<PlanSeleccionado[]>(this.endpoint);
  }

  async getById(id: number): Promise<PlanSeleccionado> {
    return this.get<PlanSeleccionado>(`${this.endpoint}/${id}`);
  }

  async create(planSeleccionado: Omit<PlanSeleccionado, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<PlanSeleccionado> {
    return this.post<PlanSeleccionado>(this.endpoint, planSeleccionado);
  }

  async update(id: number, planSeleccionado: Partial<Omit<PlanSeleccionado, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<PlanSeleccionado> {
    return this.put<PlanSeleccionado>(`${this.endpoint}/${id}`, planSeleccionado);
  }

  async remove(id: number): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
