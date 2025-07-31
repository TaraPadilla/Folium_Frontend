import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, MapPin, Clock, Users, CheckCircle } from 'lucide-react';
import { Visita, Cliente, Equipo } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Extensión temporal del tipo Visita para permitir contratoId y nombres
interface VisitaHojaRuta extends Visita {
  contratoId: string;
  clienteNombre: string;
  equipoNombre: string;
}

const HojaRuta = () => {
  // Selector de rango (día/semana)
  const [rango, setRango] = useState<'dia' | 'semana'>('dia');
  const [fecha, setFecha] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [visitas, setVisitas] = useState<VisitaHojaRuta[]>([]);
  const [contratos, setContratos] = useState<Record<string, { tareas: { nombre: string, visible: boolean }[] }>>({});
  const [loading, setLoading] = useState(false);
  const [observaciones, setObservaciones] = useState<Record<string, string>>({});
  const [tareasRealizadas, setTareasRealizadas] = useState<Record<string, string[]>>({});

  // Mock carga de visitas y contratos
  useEffect(() => {
    setLoading(true);
    // Simular fetch de visitas según rango y fecha
    setTimeout(() => {
      // Visitas para el encargado
      const mockVisitas: VisitaHojaRuta[] = [
        {
          id: 'v1',
          clienteId: '1',
          clienteNombre: 'Jardín Villa Rosa',
          equipoId: '1',
          equipoNombre: 'Equipo Alpha',
          contratoId: 'c1',
          fechaProgramada: fecha,
          estado: 'programada',
          tareasRealizadas: [],
          observaciones: '',
          direccion: 'Av. Principal 123',
          tareasProgramadas: ['Poda de césped', 'Riego de plantas'],
          tareasAdicionales: []
        },
        {
          id: 'v2',
          clienteId: '2',
          clienteNombre: 'Condominio Los Pinos',
          equipoId: '1',
          equipoNombre: 'Equipo Alpha',
          contratoId: 'c2',
          fechaProgramada: fecha,
          estado: 'programada',
          tareasRealizadas: [],
          observaciones: '',
          direccion: 'Calle Secundaria 456',
          tareasProgramadas: ['Mantenimiento de jardines', 'Poda de arbustos'],
          tareasAdicionales: []
        }
      ];
      setVisitas(mockVisitas);
      // Simular fetch de contratos asociados a las visitas
      setContratos({
        c1: { tareas: [ { nombre: 'Poda de césped', visible: true }, { nombre: 'Riego de plantas', visible: true }, { nombre: 'Limpieza general', visible: false } ] },
        c2: { tareas: [ { nombre: 'Mantenimiento de jardines', visible: true }, { nombre: 'Poda de arbustos', visible: true } ] }
      });
      setLoading(false);
    }, 500);
  }, [rango, fecha]);

  // Handlers
  const marcarTarea = (visitaId: string, tarea: string) => {
    setTareasRealizadas(prev => {
      const tareas = prev[visitaId] || [];
      if (tareas.includes(tarea)) {
        return { ...prev, [visitaId]: tareas.filter(t => t !== tarea) };
      } else {
        return { ...prev, [visitaId]: [...tareas, tarea] };
      }
    });
  };
  const marcarTodas = (visitaId: string, tareas: string[]) => {
    setTareasRealizadas(prev => ({ ...prev, [visitaId]: tareas }));
  };
  const handleObservacion = (visitaId: string, value: string) => {
    setObservaciones(prev => ({ ...prev, [visitaId]: value }));
  };
  const cerrarVisita = (visitaId: string) => {
    // Aquí guardarías el estado en backend
    setVisitas(prev => prev.map(v => v.id === visitaId ? { ...v, estado: 'completada' } : v));
  };

  // Card colapsable: control de expansión múltiple
  const [expandedCardIds, setExpandedCardIds] = useState<string[]>([]);
  useEffect(() => {
    if (visitas.length > 0) setExpandedCardIds([visitas[0].id]);
  }, [visitas.length]);

  // Filtro por equipo
  const [equipoFiltro, setEquipoFiltro] = useState<string>('todos');
  const equiposUnicos = Array.from(new Set(visitas.map(v => v.equipoId)));
  const visitasFiltradas = equipoFiltro === 'todos'
    ? visitas
    : visitas.filter(v => v.equipoId === equipoFiltro);

  // UI
  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Mi Hoja de Ruta</h1>
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-6 justify-center">
        <select value={rango} onChange={e => setRango(e.target.value as 'dia' | 'semana')} className="border rounded px-2 py-1">
          <option value="dia">Día</option>
          <option value="semana">Semana</option>
        </select>
        <input type={rango === 'dia' ? 'date' : 'week'} value={fecha} onChange={e => setFecha(e.target.value)} className="border rounded px-2 py-1" />
        <select value={equipoFiltro} onChange={e => setEquipoFiltro(e.target.value)} className="border rounded px-2 py-1">
          <option value="todos">Todos los equipos</option>
          {equiposUnicos.map(eid => {
            const eqName = visitas.find(v => v.equipoId === eid)?.equipoNombre || eid;
            return <option key={eid} value={eid}>{eqName}</option>;
          })}
        </select>
        <span className="text-sm text-gray-500">Total visitas: {visitasFiltradas.length} | Completadas: {visitasFiltradas.filter(v => v.estado === 'completada').length}</span>
      </div>
      {loading ? (
        <div className="text-center text-gray-500 py-8">Cargando visitas...</div>
      ) : visitas.length === 0 ? (
        <div className="text-center text-gray-400 py-8">No hay visitas para mostrar.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
          {visitasFiltradas.map((visita, idx) => {
            const contrato = contratos[visita.contratoId];
            const tareasVisibles = contrato ? contrato.tareas.filter(t => t.visible).map(t => t.nombre) : [];
            const expanded = expandedCardIds.includes(visita.id);
            return (
              <Card key={visita.id} className={`h-full flex flex-col shadow-md transition-all duration-300 ${expanded ? 'ring-2 ring-green-500' : ''}`}>
                <div
                  className="cursor-pointer select-none"
                  onClick={() => {
                    setExpandedCardIds(prev =>
                      expanded ? prev.filter(id => id !== visita.id) : [...prev, visita.id]
                    );
                  }}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-green-600" />
                        {visita.clienteNombre}
                      </CardTitle>
                      <div className="text-xs text-gray-500 mt-1">{visita.direccion}</div>
                      <div className="text-xs text-gray-500">{visita.equipoNombre}</div>
                      <div className="text-sm text-gray-600">{visita.fechaProgramada}</div>
                      <Badge color={visita.estado === 'completada' ? 'green' : 'yellow'}>
                        {visita.estado}
                      </Badge>
                    </div>
                    <div className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
                    </div>
                  </CardHeader>
                </div>
                {expanded && (
                  <CardContent>
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">Tareas:</span>
                        <Button size="sm" onClick={() => marcarTodas(visita.id, tareasVisibles)} className="ml-auto">
                          Marcar todas
                        </Button>
                      </div>
                      <ul>
                        {tareasVisibles.map((tarea, idx) => (
                          <li key={idx} className="flex items-center gap-2 mb-1">
                            <Checkbox checked={tareasRealizadas[visita.id]?.includes(tarea) || false} onCheckedChange={() => marcarTarea(visita.id, tarea)} />
                            <span>{tarea}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mb-2">
                      <Textarea
                        placeholder="Observaciones..."
                        value={observaciones[visita.id] || ''}
                        onChange={e => handleObservacion(visita.id, e.target.value)}
                        rows={2}
                      />
                    </div>
                    <Button
                      disabled={!tareasRealizadas[visita.id] || tareasRealizadas[visita.id].length === 0 || visita.estado === 'completada'}
                      onClick={() => cerrarVisita(visita.id)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {visita.estado === 'completada' ? (
                        <span><CheckCircle className="inline w-4 h-4 mr-1" /> Servicio completado</span>
                      ) : (
                        "Cerrar servicio"
                      )}
                    </Button>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

const HojaRuta2 = () => {
  const [visitasHoy, setVisitasHoy] = useState<Visita[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);

  // Mock data
  useEffect(() => {
    const mockClientes: Cliente[] = [
      {
        id: '1',
        nombre: 'Jardín Villa Rosa',
        direccion: 'Av. Principal 123',
        telefono: '555-0101',
        email: 'villa.rosa@email.com',
        grupo: 'A',
        plan: 'semanal',
        diaAsignado: 'Lunes',
        fechaRegistro: '2024-01-15',
        activo: true,
        observaciones: '',
        historial: []
      },
      {
        id: '2',
        nombre: 'Condominio Los Pinos',
        direccion: 'Calle 45 #78-90',
        telefono: '555-0102',
        email: 'lospinos@email.com',
        grupo: 'B',
        plan: 'quincenal',
        diaAsignado: 'Miércoles',
        fechaRegistro: '2024-01-20',
        activo: true,
        observaciones: '',
        historial: []
      }
    ];

    const mockEquipos: Equipo[] = [
      {
        id: '1',
        nombre: 'Equipo Alpha',
        encargadoId: '3',
        encargadoNombre: 'Carlos Hernández',
        activo: true,
        miembros: ['Carlos Hernández', 'José Martínez']
      }
    ];

    setClientes(mockClientes);
    setEquipos(mockEquipos);
    //setVisitasHoy(mockVisitas);
  }, []);

  const marcarVisitaCompleta = (visitaId: string) => {
    setVisitasHoy(prev => prev.map(visita => 
      visita.id === visitaId 
        ? { ...visita, estado: 'completada', fechaEjecucion: new Date().toISOString() }
        : visita
    ));
  };

  const actualizarTareasRealizadas = (visitaId: string, tareas: string[]) => {
    setVisitasHoy(prev => prev.map(visita => 
      visita.id === visitaId 
        ? { ...visita, tareasRealizadas: tareas }
        : visita
    ));
  };

  const actualizarObservaciones = (visitaId: string, observaciones: string) => {
    setVisitasHoy(prev => prev.map(visita => 
      visita.id === visitaId 
        ? { ...visita, observaciones }
        : visita
    ));
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'programada':
        return <Badge variant="outline">Programada</Badge>;
      case 'en_proceso':
        return <Badge className="bg-yellow-500">En Proceso</Badge>;
      case 'completada':
        return <Badge className="bg-green-500">Completada</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header - Mobile First */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Hoja de Ruta</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Visitas programadas para hoy - {format(new Date(), 'dd/MM/yyyy', { locale: es })}
        </p>
      </div>

      {/* Visits Grid - Mobile First */}
      <div className="space-y-4 sm:space-y-6">
        {visitasHoy.map((visita) => (
          <Card key={visita.id} className="overflow-hidden">
            <CardHeader className="bg-green-50 border-b p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-0 sm:flex sm:justify-between sm:items-start">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                    {visita.clienteNombre}
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{visita.equipoNombre}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>{format(new Date(visita.fechaProgramada), 'HH:mm')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
                  {getEstadoBadge(visita.estado)}
                  {visita.estado !== 'completada' && (
                    <Button
                      onClick={() => marcarVisitaCompleta(visita.id)}
                      className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Completar</span>
                      <span className="sm:hidden">OK</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
                {/* Tasks Section */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                    Tareas Programadas
                  </h4>
                  <div className="space-y-2">
                    {visita.tareasProgramadas.map((tarea, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Checkbox
                          id={`tarea-${visita.id}-${index}`}
                          checked={visita.tareasRealizadas.includes(tarea)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              actualizarTareasRealizadas(visita.id, [...visita.tareasRealizadas, tarea]);
                            } else {
                              actualizarTareasRealizadas(
                                visita.id, 
                                visita.tareasRealizadas.filter(t => t !== tarea)
                              );
                            }
                          }}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <label
                          htmlFor={`tarea-${visita.id}-${index}`}
                          className={`text-sm leading-relaxed ${
                            visita.tareasRealizadas.includes(tarea) 
                              ? 'line-through text-gray-500' 
                              : 'text-gray-700'
                          }`}
                        >
                          {tarea}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Observations Section */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                    Observaciones
                  </h4>
                  <Textarea
                    placeholder="Notas sobre la visita..."
                    value={visita.observaciones}
                    onChange={(e) => actualizarObservaciones(visita.id, e.target.value)}
                    className="min-h-[80px] sm:min-h-[100px] text-sm"
                  />
                </div>
              </div>

              {/* Completion Info */}
              {visita.fechaEjecucion && (
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <p className="text-xs sm:text-sm text-green-800">
                    <strong>Completada:</strong> {format(new Date(visita.fechaEjecucion), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {visitasHoy.length === 0 && (
          <Card>
            <CardContent className="p-8 sm:p-12 text-center">
              <CalendarIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                No hay visitas programadas
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                No tienes visitas asignadas para el día de hoy.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HojaRuta;
