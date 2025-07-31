
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, isSameDay, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Visita } from '@/types';
import { Clock, MapPin, Users, CheckCircle } from 'lucide-react';

interface VistaDiariaProps {
  visitas: Visita[];
  fechaSeleccionada: Date;
  setFechaSeleccionada: (fecha: Date) => void;
  clientes: any[];
  equipos: any[];
}

const VistaDiaria: React.FC<VistaDiariaProps> = ({ 
  visitas, 
  fechaSeleccionada, 
  setFechaSeleccionada,
  clientes,
  equipos 
}) => {
  const visitasHoy = visitas.filter(visita => 
    isSameDay(new Date(visita.fechaProgramada + 'T00:00:00'), fechaSeleccionada)
  );

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'programada':
        return <Badge variant="outline">Programada</Badge>;
      case 'en_proceso':
        return <Badge className="bg-yellow-500">En Proceso</Badge>;
      case 'completada':
        return <Badge className="bg-green-500">Completada</Badge>;
      case 'reagendada':
        return <Badge className="bg-blue-500">Reagendada</Badge>;
      case 'cancelada':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  console.log('visitasHoy', visitasHoy);
  const visitasPorEquipo = visitasHoy.reduce((acc, visita) => {
    if (!acc[visita.equipoId]) {
      acc[visita.equipoId] = [];
    }
    acc[visita.equipoId].push(visita);
    return acc;
  }, {} as Record<string, Visita[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Vista Diaria - {format(fechaSeleccionada, 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es })}</span>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setFechaSeleccionada(subDays(fechaSeleccionada, 1))}
              >
                ← Anterior
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setFechaSeleccionada(new Date())}
              >
                Hoy
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setFechaSeleccionada(addDays(fechaSeleccionada, 1))}
              >
                Siguiente →
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{visitasHoy.length}</div>
              <div className="text-blue-800">Visitas Programadas</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {visitasHoy.filter(v => v.estado === 'completada').length}
              </div>
              <div className="text-green-800">Completadas</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {visitasHoy.filter(v => v.estado === 'programada').length}
              </div>
              <div className="text-yellow-800">Pendientes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {Object.keys(visitasPorEquipo).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No hay visitas programadas para este día
          </CardContent>
        </Card>
      ) : (
        Object.entries(visitasPorEquipo).map(([equipoId, visitasEquipo]) => {
          const equipo = equipos.find(e => e.id === Number(equipoId));
          return (
            <Card key={equipoId}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  {visitasEquipo[0]?.equipoNombre || 'Equipo Desconocido'}
                  <Badge variant="outline" className="ml-2">
                    {visitasEquipo.length} visitas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {visitasEquipo.map(visita => {
                    const cliente = clientes.find(c => c.id === visita.clienteId);
                    return (
                      <div key={visita.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-lg">{visita.clienteNombre}</h3>
                              {getEstadoBadge(visita.estado)}
                            </div>
                            
                            <div className="text-gray-600 space-y-1">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                {visita.direccion || cliente?.direccion || 'Dirección no disponible'}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                {format(new Date(visita.fechaProgramada), 'HH:mm')} hrs
                              </div>
                            </div>

                            <div className="mt-3">
                              <h4 className="font-medium text-sm text-gray-700 mb-2">
                                Tareas Programadas ({visita.tareasProgramadas.length}):
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {visita.tareasProgramadas.map((tarea, index) => (
                                  <div key={index} className="flex items-center text-sm">
                                    <CheckCircle className="h-3 w-3 mr-2 text-gray-400" />
                                    {tarea}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {visita.observaciones && (
                              <div className="mt-3 p-2 bg-yellow-50 rounded text-sm">
                                <strong>Observaciones:</strong> {visita.observaciones}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default VistaDiaria;
