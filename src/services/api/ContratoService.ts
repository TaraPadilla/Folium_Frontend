import { BaseApiService } from './BaseApiService';

export interface Contrato {
  id?: number;
  cliente_id: number;
  equipo_id: number;
  cotizacion_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  frecuencia: string;
  dia_visita: string;
}

export class ContratoService extends BaseApiService {
  private endpoint = '/contratos';

  async getAll(): Promise<Contrato[]> {
    const response = await this.get<{ data: Contrato[] }>(this.endpoint);
    return response.data;
  }

  async getById(id: number): Promise<Contrato> {
    const response = await this.get<{ data: Contrato }>(`${this.endpoint}/${id}`);
    return response.data;
  }

  async create(contrato: Omit<Contrato, 'id'>): Promise<Contrato> {
    console.log('Contrato a guardar:', contrato);
    const response = await this.post<{ data: Contrato }>(this.endpoint, contrato);
    return response.data;
  }

  async update(id: number, contrato: Partial<Omit<Contrato, 'id'>>): Promise<Contrato> {
    const response = await this.put<{ data: Contrato }>(`${this.endpoint}/${id}`, contrato);
    return response.data;
  }

  async remove(id: number): Promise<void> {
    await this.delete<void>(`${this.endpoint}/${id}`);
  }
}
