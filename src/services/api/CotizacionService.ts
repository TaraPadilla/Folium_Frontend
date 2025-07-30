import { BaseApiService } from './BaseApiService';

export interface CotizacionCliente {
  id: number;
  nombre: string;
  direccion?: string;
  ciudad_id?: number;
  estado?: string;
  nombre_contacto?: string;
  celular_contacto?: string;
  correo_contacto?: string;
  fecha_alta?: string;
  fecha_aceptacion?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  link_ubicacion?: string;
  observaciones?: string;
}

export interface Cotizacion {
  id: number;
  cliente: CotizacionCliente | null;
  cliente_id: number;
  contrato_id?: number;
  fecha_creacion: string;
  ruta_pdf: string;
  estado: string;
  fecha_envio: string;
  fecha_aceptacion: string;
  consideraciones?: string;
  propuesta_economica?: string;
  planes_seleccionados?: PlanSeleccionadoConTareas[];
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}


export interface PlanSeleccionadoConTareas {
  id: number;
  origen_tipo: string;
  origen_id: number;
  plan_id: number;
  plan?: PlanBase;
  nombre_personalizado?: string;
  precio_referencial?: string;
  tareas_seleccionadas?: TareaSeleccionadaBackend[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface PlanBase {
  id: number;
  nombre: string;
  descripcion: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  tareas?: any[];
}

export interface TareaSeleccionadaBackend {
  id: number;
  plan_seleccionado_id: number;
  tarea_id: number;
  tarea?: {
    id: number;
    nombre: string;
    plan_id: number;
    tipo: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  incluida: number;
  visible_para_encargado: number;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export class CotizacionService extends BaseApiService {
  private endpoint = '/cotizaciones';

  async getAll(): Promise<Cotizacion[]> {
    const response = await this.get<Cotizacion[]>(this.endpoint); 
    return response;
  }

  async getById(id: number): Promise<Cotizacion> {
    return this.get<Cotizacion>(`${this.endpoint}/${id}`);
  }

  async create(cotizacion: Omit<Cotizacion, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Cotizacion> {
    return this.post<Cotizacion>(this.endpoint, cotizacion);
  }

  async update(id: number, cotizacion: Partial<Omit<Cotizacion, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<Cotizacion> {
    return this.put<Cotizacion>(`${this.endpoint}/${id}`, cotizacion);
  }

  async remove(id: number): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }

  async actualizarEstado(id: number, estado: string): Promise<Cotizacion> {
    return this.put<Cotizacion>(`${this.endpoint}/actualizarestado`, { id, estado });
  }
}
