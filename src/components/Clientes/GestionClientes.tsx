
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
import { toast } from '@/hooks/use-toast';
import { ClientService, Client } from '@/services/api/ClientService';
import { CityService, City } from '@/services/api/CityService';

const GestionClientes = () => {
  const clientService = new ClientService();
  const cityService = new CityService();
  const [clientes, setClientes] = useState<Client[]>([]);
  const [ciudades, setCiudades] = useState<City[]>([]);

  React.useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await clientService.getAll();
        setClientes(Array.isArray(data) ? data : []);
      } catch (err) {
        setClientes([]);
      }
    };
    const fetchCiudades = async () => {
      try {
        const data = await cityService.getAll();
        setCiudades(Array.isArray(data) ? data : []);
      } catch (err) {
        setCiudades([]);
      }
    };
    fetchClientes();
    fetchCiudades();
  }, []);

  const [searchText, setSearchText] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad_id: '',
    estado: 'prospecto',
    nombre_contacto: '',
    celular_contacto: '',
    correo_contacto: '',
    fecha_alta: '',
    fecha_aceptacion: ''
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      direccion: '',
      ciudad_id: '',
      estado: 'prospecto',
      nombre_contacto: '',
      celular_contacto: '',
      correo_contacto: '',
      fecha_alta: '',
      fecha_aceptacion: ''
    });
    setClienteEditando(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (clienteEditando) {
        await clientService.update(clienteEditando.id, {
          ...formData,
          ciudad_id: Number(formData.ciudad_id),
          fecha_alta: formData.fecha_alta?.split('T')[0] || null
        });
        toast({
          title: "Cliente actualizado",
          description: "Los datos del cliente han sido actualizados correctamente.",
        });
      } else {
        await clientService.create({
          ...formData,
          ciudad_id: Number(formData.ciudad_id),
          fecha_alta: new Date().toISOString().split('T')[0] // <-- solo YYYY-MM-DD
        });
        toast({
          title: "Cliente registrado",
          description: "El nuevo cliente ha sido registrado exitosamente.",
        });
      }
      // Refrescar lista
      const data = await clientService.getAll();
      setClientes(Array.isArray(data) ? data : []);
      resetForm();
      setIsDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Error al guardar cliente" });
    }
  };

  const editarCliente = (cliente: Client) => {
    setClienteEditando(cliente);
    setFormData({
      nombre: cliente.nombre,
      direccion: cliente.direccion,
      ciudad_id: cliente.ciudad_id?.toString() || '',
      estado: cliente.estado,
      nombre_contacto: cliente.nombre_contacto,
      celular_contacto: cliente.celular_contacto,
      correo_contacto: cliente.correo_contacto,
      fecha_alta: cliente.fecha_alta || '',
      fecha_aceptacion: cliente.fecha_aceptacion || ''
    });
    setIsDialogOpen(true);
  };

  const clientesFiltrados = clientes.filter(cliente => {
    const coincideTexto = cliente.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
                         cliente.correo_contacto.toLowerCase().includes(searchText.toLowerCase());
    const coincideGrupo = filtroGrupo === 'todos' || cliente.estado === filtroGrupo;
    
    return coincideTexto && coincideGrupo;
  });

  const getGrupoColor = (grupo: string) => {
    switch (grupo) {
      case 'prospecto': return 'bg-green-100 text-green-800';
      case 'activo': return 'bg-blue-100 text-blue-800';
      case 'inactivo': return 'bg-gray-100 text-gray-800';
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={formData.nombre}
                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dirección</Label>
                  <Input
                    value={formData.direccion}
                    onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  <Select
                    value={formData.ciudad_id}
                    onValueChange={value => setFormData({ ...formData, ciudad_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona ciudad" />
                    </SelectTrigger>
                    <SelectContent>
                      {ciudades.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.ciudad}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={value => setFormData({ ...formData, estado: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospecto">Prospecto</SelectItem>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nombre contacto</Label>
                  <Input
                    value={formData.nombre_contacto}
                    onChange={e => setFormData({ ...formData, nombre_contacto: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Celular contacto</Label>
                  <Input
                    value={formData.celular_contacto}
                    onChange={e => setFormData({ ...formData, celular_contacto: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Correo contacto</Label>
                  <Input
                    type="email"
                    value={formData.correo_contacto}
                    onChange={e => setFormData({ ...formData, correo_contacto: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { resetForm(); setIsDialogOpen(false); }}>Cancelar</Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
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
                <div className="text-sm text-gray-600">
                  <p><strong>Ciudad:</strong> {ciudades.find(c => c.id === cliente.ciudad_id)?.ciudad || cliente.ciudad_id}</p>
                  <p><strong>Estado:</strong> {cliente.estado}</p>
                  <p><strong>Contacto:</strong> {cliente.nombre_contacto || '—'}</p>
                  <p><strong>Celular:</strong> {cliente.celular_contacto || '—'}</p>
                  <p><strong>Correo:</strong> {cliente.correo_contacto || '—'}</p>
                  <p><strong>Fecha alta:</strong> {cliente.fecha_alta || '—'}</p>
                  <p><strong>Fecha aceptación:</strong> {cliente.fecha_aceptacion || '—'}</p>
                </div>
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
