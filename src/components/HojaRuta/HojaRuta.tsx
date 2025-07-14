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

const HojaRuta = () => {
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

    const mockVisitas: Visita[] = [
      {
        id: '1',
        clienteId: '1',
        clienteNombre: 'Jardín Villa Rosa',
        equipoId: '1',
        equipoNombre: 'Equipo Alpha',
        fechaProgramada: format(new Date(), 'yyyy-MM-dd'),
        estado: 'programada',
        tareasProgramadas: ['Poda de césped', 'Riego de plantas', 'Limpieza general'],
        tareasRealizadas: [],
        tareasAdicionales: [],
        observaciones: ''
      },
      {
        id: '2',
        clienteId: '2',
        clienteNombre: 'Condominio Los Pinos',
        equipoId: '1',
        equipoNombre: 'Equipo Alpha',
        fechaProgramada: format(new Date(), 'yyyy-MM-dd'),
        estado: 'en_proceso',
        tareasProgramadas: ['Mantenimiento de jardines', 'Poda de arbustos'],
        tareasRealizadas: ['Mantenimiento de jardines'],
        tareasAdicionales: [],
        observaciones: 'Cliente solicita atención especial a las rosas'
      }
    ];

    setClientes(mockClientes);
    setEquipos(mockEquipos);
    setVisitasHoy(mockVisitas);
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
