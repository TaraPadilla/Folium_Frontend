
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Search, Users } from 'lucide-react';
import { Cliente } from '@/types';
import { toast } from '@/hooks/use-toast';

const GestionClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: '1',
      nombre: 'Jardines del Norte S.A.',
      direccion: 'Av. Principal 123, Zona Norte',
      telefono: '+502 2234-5678',
      email: 'contacto@jardinesnorte.com',
      grupo: 'A',
      plan: 'semanal',
      diaAsignado: 'lunes',
      fechaRegistro: '2024-01-15',
      activo: true,
      observaciones: 'Cliente VIP, requiere atención especial en temporada de lluvia',
      historial: []
    },
    {
      id: '2',
      nombre: 'Villa Hermosa',
      direccion: 'Calle Las Flores 456, Villa Hermosa',
      telefono: '+502 2345-6789',
      email: 'info@villahermosa.com',
      grupo: 'B',
      plan: 'quincenal',
      diaAsignado: 'miércoles',
      fechaRegistro: '2024-02-01',
      activo: true,
      observaciones: 'Acceso por portón lateral',
      historial: []
    }
  ]);

  const [searchText, setSearchText] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    grupo: 'C' as 'A' | 'B' | 'C',
    plan: 'semanal' as 'semanal' | 'quincenal' | 'mensual',
    diaAsignado: 'lunes',
    observaciones: ''
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      grupo: 'C',
      plan: 'semanal',
      diaAsignado: 'lunes',
      observaciones: ''
    });
    setClienteEditando(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (clienteEditando) {
      // Editar cliente existente
      setClientes(prev => prev.map(cliente => 
        cliente.id === clienteEditando.id 
          ? { ...cliente, ...formData }
          : cliente
      ));
      toast({
        title: "Cliente actualizado",
        description: "Los datos del cliente han sido actualizados correctamente.",
      });
    } else {
      // Crear nuevo cliente
      const nuevoCliente: Cliente = {
        id: Date.now().toString(),
        ...formData,
        fechaRegistro: new Date().toISOString().split('T')[0],
        activo: true,
        historial: []
      };
      
      setClientes(prev => [...prev, nuevoCliente]);
      toast({
        title: "Cliente registrado",
        description: "El nuevo cliente ha sido registrado exitosamente.",
      });
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const editarCliente = (cliente: Cliente) => {
    setClienteEditando(cliente);
    setFormData({
      nombre: cliente.nombre,
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      email: cliente.email,
      grupo: cliente.grupo,
      plan: cliente.plan,
      diaAsignado: cliente.diaAsignado,
      observaciones: cliente.observaciones
    });
    setIsDialogOpen(true);
  };

  const clientesFiltrados = clientes.filter(cliente => {
    const coincideTexto = cliente.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
                         cliente.email.toLowerCase().includes(searchText.toLowerCase());
    const coincideGrupo = filtroGrupo === 'todos' || cliente.grupo === filtroGrupo;
    
    return coincideTexto && coincideGrupo;
  });

  const getGrupoColor = (grupo: string) => {
    switch (grupo) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'semanal': return 'bg-purple-100 text-purple-800';
      case 'quincenal': return 'bg-orange-100 text-orange-800';
      case 'mensual': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Clientes</h1>
          <p className="text-gray-600">Administra tu base de clientes activos</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700" onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white">
            <DialogHeader>
              <DialogTitle>
                {clienteEditando ? 'Editar Cliente' : 'Nuevo Cliente'}
              </DialogTitle>
              <DialogDescription>
                {clienteEditando ? 'Modifica los datos del cliente' : 'Completa la información del nuevo cliente'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grupo">Grupo</Label>
                  <Select value={formData.grupo} onValueChange={(value: 'A' | 'B' | 'C') => setFormData({...formData, grupo: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="A">Grupo A</SelectItem>
                      <SelectItem value="B">Grupo B</SelectItem>
                      <SelectItem value="C">Grupo C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan">Plan</Label>
                  <Select value={formData.plan} onValueChange={(value: 'semanal' | 'quincenal' | 'mensual') => setFormData({...formData, plan: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="quincenal">Quincenal</SelectItem>
                      <SelectItem value="mensual">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dia">Día Asignado</Label>
                  <Select value={formData.diaAsignado} onValueChange={(value) => setFormData({...formData, diaAsignado: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="lunes">Lunes</SelectItem>
                      <SelectItem value="martes">Martes</SelectItem>
                      <SelectItem value="miércoles">Miércoles</SelectItem>
                      <SelectItem value="jueves">Jueves</SelectItem>
                      <SelectItem value="viernes">Viernes</SelectItem>
                      <SelectItem value="sábado">Sábado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  placeholder="Notas adicionales sobre el cliente..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {clienteEditando ? 'Actualizar' : 'Registrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Buscar cliente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre o email..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-40">
              <Label htmlFor="filtro-grupo">Filtrar por grupo</Label>
              <Select value={filtroGrupo} onValueChange={setFiltroGrupo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="A">Grupo A</SelectItem>
                  <SelectItem value="B">Grupo B</SelectItem>
                  <SelectItem value="C">Grupo C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientesFiltrados.map((cliente) => (
          <Card key={cliente.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{cliente.nombre}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editarCliente(cliente)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>{cliente.direccion}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Badge className={getGrupoColor(cliente.grupo)}>
                    Grupo {cliente.grupo}
                  </Badge>
                  <Badge className={getPlanColor(cliente.plan)}>
                    {cliente.plan}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p><strong>Teléfono:</strong> {cliente.telefono}</p>
                  <p><strong>Email:</strong> {cliente.email}</p>
                  <p><strong>Día:</strong> {cliente.diaAsignado}</p>
                </div>
                
                {cliente.observaciones && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <strong>Observaciones:</strong> {cliente.observaciones}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clientesFiltrados.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron clientes
            </h3>
            <p className="text-gray-600">
              {searchText || filtroGrupo !== 'todos' 
                ? 'Intenta ajustar los filtros de búsqueda' 
                : 'Comienza agregando tu primer cliente'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GestionClientes;
