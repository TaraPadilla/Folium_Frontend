import { BaseApiService } from './BaseApiService';

export interface Client {
  id: number;
  nombre: string;
  direccion: string;
  ciudad_id: number;
  estado: string;
  nombre_contacto: string;
  celular_contacto: string;
  correo_contacto: string;
  fecha_alta: string;
  fecha_aceptacion: string;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export class ClientService extends BaseApiService {
  private endpoint = '/clientes';

  async getAll(): Promise<Client[]> {
    return this.get<Client[]>(this.endpoint);
  }

  async getById(id: number): Promise<Client> {
    return this.get<Client>(`${this.endpoint}/${id}`);
  }

  async create(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Client> {
    return this.post<Client>(this.endpoint, client);
  }

  async update(id: number, client: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<Client> {
    return this.put<Client>(`${this.endpoint}/${id}`, client);
  }

  async remove(id: number): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
