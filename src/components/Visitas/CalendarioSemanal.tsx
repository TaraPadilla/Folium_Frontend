import React, { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Users, RotateCcw } from 'lucide-react';
import { Visita, Cliente, Equipo } from '@/types';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CalendarioSemanalProps {
  visitas: Visita[];
  fechaSeleccionada: Date;
  clientes: Cliente[];
  equipos: Equipo[];
  onReagendarVisita: (visitaId: string, nuevaFecha: string) => void;
}

const CalendarioSemanal: React.FC<CalendarioSemanalProps> = ({
  visitas,
  fechaSeleccionada,
  clientes,
  equipos,
  onReagendarVisita
}) => {
  const [pendingReagendar, setPendingReagendar] = useState<{
    visitaId: string;
    nuevaFecha: string;
    fechaActual: string;
  } | null>(null);

  // --- Confirmación programática ---
  React.useEffect(() => {
    if (pendingReagendar) {
      setTimeout(() => {
        const btn = document.getElementById('trigger-confirm-reagendar-calendario');
        if (btn) btn.click();
      }, 0);
    }
  }, [pendingReagendar]);
  const inicioSemana = startOfWeek(fechaSeleccionada, { weekStartsOn: 1 });
  const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i));

  const handleDragStart = (e: React.DragEvent, visitaId: string) => {
    e.dataTransfer.setData('visitaId', visitaId);
    e.dataTransfer.effectAllowed = 'move';
    console.log('Arrastrando visita:', visitaId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, nuevaFecha: Date) => {
    e.preventDefault();
    const visitaId = e.dataTransfer.getData('visitaId');
    // Formatear la fecha correctamente (usar la fecha local sin conversión de zona horaria)
    const year = nuevaFecha.getFullYear();
    const month = String(nuevaFecha.getMonth() + 1).padStart(2, '0');
    const day = String(nuevaFecha.getDate()).padStart(2, '0');
    const nuevaFechaStr = `${year}-${month}-${day}`;
    const visita = visitas.find(v => v.id === visitaId);
    if (!visita) return;
    // Solo pedir confirmación si la fecha realmente cambia
    if (visita.fechaProgramada !== nuevaFechaStr) {
      setPendingReagendar({ visitaId, nuevaFecha: nuevaFechaStr, fechaActual: visita.fechaProgramada });
    }
  };

  const getVisitasPorDia = (fecha: Date) => {
    return visitas.filter(visita => {
      const fechaVisita = new Date(visita.fechaProgramada + 'T00:00:00');
      return isSameDay(fechaVisita, fecha);
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'programada':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'en_proceso':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'completada':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'reagendada':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'cancelada':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'programada':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Programada</Badge>;
      case 'en_proceso':
        return <Badge className="bg-yellow-500 text-white">En Proceso</Badge>;
      case 'completada':
        return <Badge className="bg-green-500 text-white">Completada</Badge>;
      case 'reagendada':
        return <Badge className="bg-purple-500 text-white">Reagendada</Badge>;
      case 'cancelada':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  return (
    <>
      {/* Confirmación de reagendado drag & drop */}
      {pendingReagendar && (
        <ConfirmDialog
          trigger={
            <button
              id="trigger-confirm-reagendar-calendario"
              style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }}
              autoFocus
            >Abrir</button>
          }
          title="¿Seguro que deseas reagendar esta visita?"
          description={`La visita se moverá del día ${pendingReagendar.fechaActual} al día ${pendingReagendar.nuevaFecha}.`}
          confirmText="Reagendar"
          cancelText="Cancelar"
          onConfirm={() => {
            onReagendarVisita(pendingReagendar.visitaId, pendingReagendar.nuevaFecha);
            setPendingReagendar(null);
          }}
          loading={false}
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {diasSemana.map((dia, index) => {
        const visitasDelDia = getVisitasPorDia(dia);
        const esHoy = isSameDay(dia, new Date());
        
        return (
          <div
            key={index}
            className={cn(
              "min-h-[450px] border-2 border-dashed border-gray-200 rounded-lg p-3 transition-colors",
              "hover:border-green-300 hover:bg-green-50/50"
            )}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, dia)}
          >
            <div className={cn(
              "text-center p-2 rounded-lg mb-3",
              esHoy ? "bg-green-100 text-green-800 border border-green-300" : "bg-gray-50 text-gray-700"
            )}>
              <div className="font-semibold text-sm">
                {format(dia, 'EEEE', { locale: es })}
              </div>
              <div className={cn(
                "text-xl font-bold",
                esHoy ? "text-green-800" : "text-gray-800"
              )}>
                {format(dia, 'd')}
              </div>
              <div className="text-xs text-gray-500">
                {format(dia, 'MMM', { locale: es })}
              </div>
            </div>

            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {visitasDelDia.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Arrastrar visitas aquí
                </div>
              ) : (
                visitasDelDia.map((visita, visitaIndex) => {
                  const cliente = clientes.find(c => c.id === visita.clienteId);
                  const equipo = equipos.find(e => e.id === visita.equipoId);
                  
                  return (
                    <Card
                      key={`${visita.id}-${visitaIndex}`}
                      className={cn(
                        "cursor-move transition-all duration-200 hover:shadow-lg border-l-4",
                        getEstadoColor(visita.estado),
                        "hover:scale-105 active:scale-95"
                      )}
                      draggable
                      onDragStart={(e) => handleDragStart(e, visita.id)}
                    >
                      <CardHeader className="p-3 pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold truncate">
                            {visita.clienteNombre}
                          </CardTitle>
                          {getEstadoBadge(visita.estado)}
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0 space-y-2">
                        <div className="flex items-center text-xs text-gray-600">
                          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{cliente?.direccion}</span>
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-600">
                          <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{equipo?.nombre}</span>
                        </div>

                        <div className="flex items-center text-xs text-gray-600">
                          <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>{visita.tareasProgramadas.length} tareas</span>
                        </div>

                        {visita.estado === 'programada' && (
                          <div className="pt-2 border-t border-gray-200">
                            <div className="flex flex-wrap gap-1">
                              {visita.tareasProgramadas.slice(0, 2).map((tarea, idx) => (
                                <span 
                                  key={idx}
                                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                                >
                                  {tarea}
                                </span>
                              ))}
                              {visita.tareasProgramadas.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{visita.tareasProgramadas.length - 2} más
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {visita.fechaEjecucion && (
                          <div className="text-xs text-green-600 font-medium">
                            Ejecutada: {format(new Date(visita.fechaEjecucion), 'HH:mm')}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
};

export default CalendarioSemanal;
