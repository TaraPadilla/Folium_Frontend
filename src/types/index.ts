export const roles = ['ADMIN', 'ASISTENTE', 'TECNICO'];

export interface Cliente {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  grupo: 'A' | 'B' | 'C';
  plan: 'semanal' | 'quincenal' | 'mensual';
  diaAsignado: string;
  fechaRegistro: string;
  activo: boolean;
  observaciones: string;
  historial: HistorialCliente[];
}

export interface HistorialCliente {
  id: string;
  fecha: string;
  tipo: 'cambio_plan' | 'observacion' | 'suspension';
  descripcion: string;
  planAnterior?: string;
  planNuevo?: string;
}

export interface Prospecto {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  cotizaciones: Cotizacion[];
  fechaRegistro: string;
  estado: 'activo' | 'convertido' | 'descartado';
}

export interface Cotizacion {
  id: string;
  fecha: string;
  valor: number;
  tareas: string[];
  observaciones: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
}

export interface Equipo {
  id: string;
  nombre: string;
  encargadoId: string;
  encargadoNombre: string;
  activo: boolean;
  miembros: string[];
}

export interface Tarea {
  id: string;
  nombre: string;
  descripcion: string;
  cobrable: boolean;
  tiempoEstimado: number; // en minutos
  planAsociado: 'semanal' | 'quincenal' | 'mensual' | 'todas';
}

export interface Visita {
  id: string;
  clienteId: string;
  clienteNombre: string;
  equipoId: string;
  equipoNombre: string;
  fechaProgramada: string;
  fechaEjecucion?: string;
  estado: 'programada' | 'en_proceso' | 'completada' | 'reagendada' | 'cancelada';
  tareasProgramadas: string[];
  tareasRealizadas: string[];
  tareasAdicionales: TareaAdicional[];
  observaciones: string;
  tiempoTotal?: number;
}

export interface TareaAdicional {
  id: string;
  nombre: string;
  descripcion: string;
  cobrable: boolean;
  solicitadoPor: string;
  fechaSolicitud: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'operador_logistico' | 'encargado';
  equipoId?: string;
  activo: boolean;
  fechaRegistro: string;
}

export interface Notificacion {
  id: string;
  tipo: 'visita_no_reagendada' | 'tarea_adicional' | 'visita_atrasada';
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  usuarioId: string;
}
