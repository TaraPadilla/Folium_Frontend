
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, Plus, Filter, RotateCcw, Clock, MapPin, CalendarDays, Calendar as CalendarViewIcon, Grid } from 'lucide-react';
import { Visita, Cliente, Equipo } from '@/types';
import VisitaService from '@/services/api/VisitaService';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import VistaMensual from './VistaMensual';
import VistaDiaria from './VistaDiaria';
import CalendarioSemanal from './CalendarioSemanal';

const ProgramacionVisitas = () => {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [filtros, setFiltros] = useState({
    cliente: 'all',
    equipo: 'all',
    estado: 'all'
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [nuevaVisita, setNuevaVisita] = useState({
    clienteId: '',
    equipoId: '',
    fechaProgramada: '',
    tareasProgramadas: [] as string[]
  });

  // Fetch visitas reales desde el backend
  useEffect(() => {
    const fetchVisitas = async () => {
      try {
        const data = await VisitaService.getAll();
        // Mapeo de datos del backend al formato esperado por VistaMensual
        console.log('data', data);
        const visitasBackend = data.map((visita: any) => ({
          id: visita.id.toString(),
          clienteId: visita.cliente_id?.toString() || '',
          clienteNombre: visita.cliente?.nombre || '',
          direccion: visita.cliente?.direccion || '',
          equipoId: visita.equipo_id?.toString() || '',
          equipoNombre: visita.contrato?.equipo_id ? `Equipo ${visita.contrato.equipo_id}` : '',
          fechaProgramada: visita.fecha, // formato yyyy-MM-dd
          estado: visita.estado,
          tareasProgramadas: ['Mantenimiento'], // O puedes mapear a partir de otro campo si existe
          tareasRealizadas: [], // Si tienes esta info
          tareasAdicionales: [], // Si tienes esta info
          observaciones: visita.observacion_encargado || visita.cliente?.observaciones || ''
        }));
        setVisitas(visitasBackend);
      } catch (error) {
        console.error('Error al obtener visitas:', error);
      }
    };
    fetchVisitas();
  }, [fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth()]); // Refetch cuando cambie el mes
  // Vista semanal
// Utilidad para parsear fechas locales en formato YYYY-MM-DD
function parseFechaLocal(fecha: string) {
  const [year, month, day] = fecha.split('-').map(Number);
  return new Date(year, month - 1, day);
}
  const VistaSemanal = () => {
    const inicioSemana = startOfWeek(fechaSeleccionada, { weekStartsOn: 1 });
    const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i));

    const visitasFiltradas = visitas.filter(visita => {
      const fechaVisita = new Date(visita.fechaProgramada);
      const enSemana = diasSemana.some(dia => isSameDay(fechaVisita, dia));
      const filtroCliente = filtros.cliente === 'all' || visita.clienteId === filtros.cliente;
      const filtroEquipo = filtros.equipo === 'all' || visita.equipoId === filtros.equipo;
      const filtroEstado = filtros.estado === 'all' || visita.estado === filtros.estado;
      
      return enSemana && filtroCliente && filtroEquipo && filtroEstado;
    });

    return (
      <Card>
        <CardHeader>
          <CardTitle>
            Semana del {format(inicioSemana, 'dd/MM')} al {format(addDays(inicioSemana, 6), 'dd/MM/yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Tareas</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitasFiltradas.map((visita) => (
                <TableRow key={visita.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{visita.clienteNombre}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {clientes.find(c => c.id === visita.clienteId)?.direccion}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{visita.equipoNombre}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-500" />
                      {format(parseFechaLocal(visita.fechaProgramada), 'dd/MM/yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>{getEstadoBadge(visita.estado)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {visita.tareasProgramadas.length} tareas programadas
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {visita.estado === 'programada' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const nuevaFecha = prompt('Nueva fecha (YYYY-MM-DD):');
                            if (nuevaFecha) {
                              reagendarVisita(visita.id, nuevaFecha);
                            }
                          }}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Reagendar
                        </Button>
                      )}
                      {visita.fechaEjecucion && (
                        <div className="text-xs text-green-600">
                          Ejecutada: {format(new Date(visita.fechaEjecucion), 'dd/MM HH:mm')}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {visitasFiltradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No hay visitas programadas para esta semana con los filtros aplicados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  const reagendarVisita = (visitaId: string, nuevaFecha: string) => {
    setVisitas(prev => prev.map(visita => 
      visita.id === visitaId 
        ? { ...visita, fechaProgramada: nuevaFecha, estado: 'reagendada' }
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
      case 'reagendada':
        return <Badge className="bg-blue-500">Reagendada</Badge>;
      case 'cancelada':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Programación de Visitas</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Visita
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Programar Nueva Visita</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cliente">Cliente</Label>
                  <Select value={nuevaVisita.clienteId} onValueChange={(value) => 
                    setNuevaVisita(prev => ({ ...prev, clienteId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="equipo">Equipo</Label>
                  <Select value={nuevaVisita.equipoId} onValueChange={(value) => 
                    setNuevaVisita(prev => ({ ...prev, equipoId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipos.map(equipo => (
                        <SelectItem key={equipo.id} value={equipo.id}>
                          {equipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    type="date"
                    value={nuevaVisita.fechaProgramada}
                    onChange={(e) => setNuevaVisita(prev => ({ ...prev, fechaProgramada: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  {/* <Button onClick={crearVisita} className="bg-green-600 hover:bg-green-700">
                    Programar
                  </Button> */}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Cliente</Label>
                <Select value={filtros.cliente} onValueChange={(value) => 
                  setFiltros(prev => ({ ...prev, cliente: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los clientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los clientes</SelectItem>
                    {clientes.map(cliente => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Equipo</Label>
                <Select value={filtros.equipo} onValueChange={(value) => 
                  setFiltros(prev => ({ ...prev, equipo: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los equipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los equipos</SelectItem>
                    {equipos.map(equipo => (
                      <SelectItem key={equipo.id} value={equipo.id}>
                        {equipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Estado</Label>
                <Select value={filtros.estado} onValueChange={(value) => 
                  setFiltros(prev => ({ ...prev, estado: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="programada">Programada</SelectItem>
                    <SelectItem value="en_proceso">En Proceso</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="reagendada">Reagendada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Fecha de Referencia</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(fechaSeleccionada, "dd/MM/yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fechaSeleccionada}
                      onSelect={(date) => date && setFechaSeleccionada(date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes vistas */}
      <Tabs defaultValue="diaria" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="diaria" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Vista Diaria
          </TabsTrigger>
          <TabsTrigger value="calendario" className="flex items-center">
            <Grid className="h-4 w-4 mr-2" />
            Calendario
          </TabsTrigger>
          <TabsTrigger value="semanal" className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-2" />
            Vista Semanal
          </TabsTrigger>
          <TabsTrigger value="mensual" className="flex items-center">
            <CalendarViewIcon className="h-4 w-4 mr-2" />
            Vista Mensual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diaria" className="mt-6">
          <VistaDiaria 
            visitas={visitas}
            fechaSeleccionada={fechaSeleccionada}
            setFechaSeleccionada={setFechaSeleccionada}
            clientes={clientes}
            equipos={equipos}
          />
        </TabsContent>

        <TabsContent value="calendario" className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Calendario Semanal - Semana del {format(startOfWeek(fechaSeleccionada, { weekStartsOn: 1 }), 'dd/MM')} al {format(addDays(startOfWeek(fechaSeleccionada, { weekStartsOn: 1 }), 6), 'dd/MM/yyyy')}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Arrastra las tarjetas de visitas entre los días para reagendar fácilmente
            </p>
          </div>
          <CalendarioSemanal 
            visitas={visitas.filter(visita => {
              const filtroCliente = filtros.cliente === 'all' || visita.clienteId === filtros.cliente;
              const filtroEquipo = filtros.equipo === 'all' || visita.equipoId === filtros.equipo;
              const filtroEstado = filtros.estado === 'all' || visita.estado === filtros.estado;
              return filtroCliente && filtroEquipo && filtroEstado;
            })}
            fechaSeleccionada={fechaSeleccionada}
            clientes={clientes}
            equipos={equipos}
            onReagendarVisita={reagendarVisita}
          />
        </TabsContent>
        
        <TabsContent value="semanal" className="mt-6">
          <VistaSemanal />
        </TabsContent>
        
        <TabsContent value="mensual" className="mt-6">
          <VistaMensual 
            visitas={visitas}
            fechaSeleccionada={fechaSeleccionada}
            setFechaSeleccionada={setFechaSeleccionada}
            clientes={clientes}
            onReagendarVisita={reagendarVisita}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgramacionVisitas;
