import { BaseApiService } from './BaseApiService';

export interface PlanTareaSeleccionada {
  id: number;
  plan_seleccionado_id: number;
  tarea_id: number;
  incluida: boolean;
  visible_para_encargado: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

export class PlanTareaSeleccionadaService extends BaseApiService {
  private endpoint = '/plan_tareas_seleccionadas';

  async getAll(): Promise<PlanTareaSeleccionada[]> {
    return this.get<PlanTareaSeleccionada[]>(this.endpoint);
  }

  async getById(id: number): Promise<PlanTareaSeleccionada> {
    return this.get<PlanTareaSeleccionada>(`${this.endpoint}/${id}`);
  }

  async create(planTareaSeleccionada: Omit<PlanTareaSeleccionada, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<PlanTareaSeleccionada> {
    return this.post<PlanTareaSeleccionada>(this.endpoint, planTareaSeleccionada);
  }

  async update(id: number, planTareaSeleccionada: Partial<Omit<PlanTareaSeleccionada, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<PlanTareaSeleccionada> {
    return this.put<PlanTareaSeleccionada>(`${this.endpoint}/${id}`, planTareaSeleccionada);
  }

  async remove(id: number): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
