import { BaseApiService } from './BaseApiService';

export interface Cotizacion {
  id: number;
  cliente_id: number;
  fecha_creacion: string;
  ruta_pdf: string;
  estado: string;
  fecha_envio: string;
  fecha_aceptacion: string;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export class CotizacionService extends BaseApiService {
  private endpoint = '/cotizaciones';

  async getAll(): Promise<Cotizacion[]> {
    return this.get<Cotizacion[]>(this.endpoint);
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
}
