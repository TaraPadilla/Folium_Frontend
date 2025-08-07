
import React, { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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
  const [pendingReagendar, setPendingReagendar] = useState<{
    visitaId: string;
    nuevaFecha: string;
    fechaActual: string;
  } | null>(null);

  // --- Confirmación programática ---
  React.useEffect(() => {
    if (pendingReagendar) {
      setTimeout(() => {
        const btn = document.getElementById('trigger-confirm-reagendar-mensual');
        if (btn) btn.click();
      }, 0);
    }
  }, [pendingReagendar]);
  const inicioMes = startOfMonth(fechaSeleccionada);
  const finMes = endOfMonth(fechaSeleccionada);
  const diasMes = eachDayOfInterval({ start: inicioMes, end: finMes });

  // Calcular cuántos días vacíos hay que poner antes del primer día del mes
  // getDay(): 0=Domingo, 1=Lunes, ..., 6=Sábado
  let primerDiaSemana = inicioMes.getDay();
  // Ajustar para que semana inicie en lunes (0=Lunes, 6=Domingo)
  primerDiaSemana = (primerDiaSemana === 0) ? 6 : primerDiaSemana - 1;
  const placeholders = Array.from({ length: primerDiaSemana });

  // Estado para el dialog de detalle
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [visitaDetalle, setVisitaDetalle] = React.useState<any>(null);

  const handleDragStart = (e: React.DragEvent, visitaId: string) => {
    e.dataTransfer.setData('visitaId', visitaId);
    e.dataTransfer.effectAllowed = 'move';
    console.log('Arrastrando visita:', visitaId);
  };

  const handleCardClick = (visita: any) => {
    setVisitaDetalle(visita);
    setDialogOpen(true);
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
    <>
      {/* Confirmación de reagendado drag & drop */}
      {pendingReagendar && (
        <ConfirmDialog
          trigger={
            <button
              id="trigger-confirm-reagendar-mensual"
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
          {/* Placeholders para días vacíos al inicio */}
          {placeholders.map((_, idx) => (
            <div key={`ph-${idx}`} className="min-h-[150px] bg-gray-100 rounded-lg" />
          ))}
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
                      className="text-xs p-2 bg-white rounded border shadow-sm cursor-pointer hover:shadow-md transition-all hover:scale-105 active:scale-95 border-l-2 border-l-blue-400"
                      draggable
                      onDragStart={(e) => handleDragStart(e, visita.id)}
                      onClick={() => handleCardClick(visita)}
                    >
                      <div className="font-medium truncate">
  {visita.clienteNombre}
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

      {/* Dialog de detalle de visita */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de la Visita</DialogTitle>
            <DialogDescription>
              Información completa del contrato, cliente y visita.
            </DialogDescription>
          </DialogHeader>
          {visitaDetalle && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <h4 className="font-semibold mb-1 text-gray-700">Cliente</h4>
                <div className="text-sm"><b>Nombre:</b> {visitaDetalle.cliente?.nombre || visitaDetalle.clienteNombre}</div>
                <div className="text-sm"><b>Dirección:</b> {visitaDetalle.cliente?.direccion}</div>
                <div className="text-sm"><b>Ciudad ID:</b> {visitaDetalle.cliente?.ciudad_id}</div>
                <div className="text-sm"><b>Estado:</b> {visitaDetalle.cliente?.estado}</div>
                <div className="text-sm"><b>Contacto:</b> {visitaDetalle.cliente?.nombre_contacto}</div>
                <div className="text-sm"><b>Celular:</b> {visitaDetalle.cliente?.celular_contacto}</div>
                <div className="text-sm"><b>Correo:</b> {visitaDetalle.cliente?.correo_contacto}</div>
                <div className="text-sm"><b>Observaciones:</b> {visitaDetalle.cliente?.observaciones}</div>
                {visitaDetalle.cliente?.link_ubicacion && (
                  <div className="text-sm"><b>Ubicación:</b> <a href={visitaDetalle.cliente.link_ubicacion} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver mapa</a></div>
                )}
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-gray-700">Contrato</h4>
                <div className="text-sm"><b>ID Contrato:</b> {visitaDetalle.contrato?.id || visitaDetalle.contrato_id}</div>
                <div className="text-sm"><b>Equipo ID:</b> {visitaDetalle.contrato?.equipo_id || visitaDetalle.equipoId}</div>
                <div className="text-sm"><b>Fecha Inicio:</b> {visitaDetalle.contrato?.fecha_inicio}</div>
                <div className="text-sm"><b>Fecha Fin:</b> {visitaDetalle.contrato?.fecha_fin}</div>
                <div className="text-sm"><b>Frecuencia:</b> {visitaDetalle.contrato?.frecuencia}</div>
                <div className="text-sm"><b>Día visita:</b> {visitaDetalle.contrato?.dia_visita}</div>
                <div className="text-sm"><b>Estado:</b> {visitaDetalle.contrato?.estado}</div>
              </div>
              <div className="md:col-span-2 border-t pt-3">
                <h4 className="font-semibold mb-1 text-gray-700">Datos de la Visita</h4>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div><b>ID:</b> {visitaDetalle.id}</div>
                  <div><b>Fecha:</b> {visitaDetalle.fecha || visitaDetalle.fechaProgramada}</div>
                  <div><b>Tipo:</b> {visitaDetalle.tipo_visita}</div>
                  <div><b>Estado:</b> {getEstadoBadge(visitaDetalle.estado)}</div>
                  <div><b>Observación encargado:</b> {visitaDetalle.observacion_encargado || visitaDetalle.observaciones}</div>
                  <div><b>Creado:</b> {visitaDetalle.created_at && format(new Date(visitaDetalle.created_at), 'yyyy-MM-dd HH:mm')}</div>
                  <div><b>Actualizado:</b> {visitaDetalle.updated_at && format(new Date(visitaDetalle.updated_at), 'yyyy-MM-dd HH:mm')}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)} className="mt-4">Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VistaMensual;
