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
    const response = await this.get<Contrato[]>(this.endpoint);
    console.log('Contratos obtenidos:', response);
    return response;
  }

  async getById(id: number): Promise<Contrato> {
    const response = await this.get<Contrato>(`${this.endpoint}/${id}`);
    console.log('Contrato obtenido:', response);
    return response;
  }

  async create(contrato: Omit<Contrato, 'id'>): Promise<Contrato> {
    const contratoCreado = await this.post<Contrato>(this.endpoint, contrato);
    console.log('Contrato creado:', contratoCreado);
    return contratoCreado;
  }

  async update(id: number, contrato: Partial<Omit<Contrato, 'id'>>): Promise<Contrato> {
    const contratoActualizado = await this.put<Contrato>(`${this.endpoint}/${id}`, contrato);
    console.log('Contrato actualizado:', contratoActualizado);
    return contratoActualizado;
  }

  async remove(id: number): Promise<void> {
    await this.delete<void>(`${this.endpoint}/${id}`);
  }
}
