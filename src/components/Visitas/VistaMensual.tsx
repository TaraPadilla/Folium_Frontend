
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { Visita } from '@/types';

interface VistaMensualProps {
  visitas: Visita[];
  fechaSeleccionada: Date;
  setFechaSeleccionada: (fecha: Date) => void;
  clientes: any[];
  onReagendarVisita: (visitaId: string, nuevaFecha: string) => void;
}

const VistaMensual: React.FC<VistaMensualProps> = ({ 
  visitas, 
  fechaSeleccionada, 
  setFechaSeleccionada,
  clientes,
  onReagendarVisita 
}) => {
  const inicioMes = startOfMonth(fechaSeleccionada);
  const finMes = endOfMonth(fechaSeleccionada);
  const diasMes = eachDayOfInterval({ start: inicioMes, end: finMes });

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
    
    console.log('Soltando visita:', visitaId, 'en fecha:', nuevaFechaStr);
    onReagendarVisita(visitaId, nuevaFechaStr);
  };

  const visitasPorDia = (dia: Date) => {
    return visitas.filter(visita => {
      const fechaVisita = new Date(visita.fechaProgramada + 'T00:00:00');
      return isSameDay(fechaVisita, dia);
    });
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'programada':
        return <Badge variant="outline" className="text-xs">Prog.</Badge>;
      case 'en_proceso':
        return <Badge className="bg-yellow-500 text-xs">En Proceso</Badge>;
      case 'completada':
        return <Badge className="bg-green-500 text-xs">Comp.</Badge>;
      case 'reagendada':
        return <Badge className="bg-blue-500 text-xs">Reag.</Badge>;
      case 'cancelada':
        return <Badge variant="destructive" className="text-xs">Canc.</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{estado}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Vista Mensual - {format(fechaSeleccionada, 'MMMM yyyy', { locale: es })}</span>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setFechaSeleccionada(new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth() - 1))}
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
              onClick={() => setFechaSeleccionada(new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth() + 1))}
            >
              Siguiente →
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dia => (
            <div key={dia} className="p-2 text-center font-semibold text-gray-600 border-b">
              {dia}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {diasMes.map(dia => {
            const visitasHoy = visitasPorDia(dia);
            const esHoy = isSameDay(dia, new Date());
            
            return (
              <div 
                key={dia.toISOString()} 
                className={`min-h-[150px] p-2 border-2 border-dashed rounded-lg transition-colors ${
                  esHoy ? 'bg-blue-50 border-blue-200' : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                }`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, dia)}
              >
                <div className={`text-sm font-medium mb-2 ${
                  esHoy ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  {format(dia, 'd')}
                </div>
                
                <div className="space-y-1 max-h-[120px] overflow-y-auto">
                  {visitasHoy.map((visita, index) => (
                    <div 
                      key={`${visita.id}-${index}`}
                      className="text-xs p-2 bg-white rounded border shadow-sm cursor-move hover:shadow-md transition-all hover:scale-105 active:scale-95 border-l-2 border-l-blue-400"
                      draggable
                      onDragStart={(e) => handleDragStart(e, visita.id)}
                    >
                      <div className="font-medium truncate mb-1">
                        {visita.clienteNombre}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 truncate text-xs flex-1 mr-1">
                          {visita.equipoNombre}
                        </span>
                        {getEstadoBadge(visita.estado)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {visita.tareasProgramadas.length} tareas
                      </div>
                    </div>
                  ))}
                </div>
                
                {visitasHoy.length === 0 && (
                  <div className="text-center py-4 text-gray-400 text-xs">
                    Arrastrar visitas aquí
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default VistaMensual;
