import { BaseApiService } from './BaseApiService';

export interface ClienteVisita {
  id: number;
  nombre: string;
  direccion: string;
  ciudad_id: number;
  estado: string;
  nombre_contacto: string;
  celular_contacto: string;
  correo_contacto: string;
  fecha_alta: string;
  fecha_aceptacion: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  link_ubicacion: string;
  observaciones: string;
}

export interface ContratoVisita {
  id: number;
  cliente_id: number;
  equipo_id: number;
  cotizacion_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  frecuencia: string;
  dia_visita: string;
}

export interface Visita {
  tareasProgramadas: any;
  id: number;
  cliente_id: number;
  cliente: ClienteVisita;
  equipo_id: number;
  contrato_id: number;
  contrato: ContratoVisita;
  fecha: string;
  tipo_visita: string;
  estado: string;
  observacion_encargado: string | null;
  cerrada_por: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export class VisitaService extends BaseApiService {
  private endpoint = '/visitas';
  async getAll(): Promise<Visita[]> {
    return this.get<Visita[]>(this.endpoint);
  }

  async getById(id: number): Promise<Visita> {
    return this.get<Visita>(`${this.endpoint}/${id}`);
  }

  async create(visita: Omit<Visita, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<Visita> {
    return this.post<Visita>(this.endpoint, visita);
  }

  async update(id: number, visita: Partial<Omit<Visita, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<Visita> {
    return this.put<Visita>(`${this.endpoint}/${id}`, visita);
  }

  async remove(id: number): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }

  async actualizarEstado(id: number, estado: string): Promise<Visita> {
    return this.put<Visita>(`${this.endpoint}/actualizarestado`, { id, estado });
  }
  async ejecutarAgendamiento(id: number): Promise<any> {
    return this.post<any>(`${this.endpoint}/ejecutar-agendamiento/${id}`, {});
  }

}

export default new VisitaService();
