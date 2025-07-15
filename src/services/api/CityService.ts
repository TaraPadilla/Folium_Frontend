import { BaseApiService } from './BaseApiService';

export interface City {
  id: number;
  ciudad: string;
  provincia: string;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export class CityService extends BaseApiService {
  private endpoint = 'gestion/ciudades';

  async getAll(): Promise<City[]> {
    return this.get<City[]>(this.endpoint);
  }

  async getById(id: number): Promise<City> {
    return this.get<City>(`${this.endpoint}/${id}`);
  }

  async create(city: Omit<City, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<City> {
    return this.post<City>(this.endpoint, city);
  }

  async update(id: number, city: Partial<Omit<City, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<City> {
    return this.put<City>(`${this.endpoint}/${id}`, city);
  }

  async remove(id: number): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
