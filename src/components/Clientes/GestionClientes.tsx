
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
  // Ordenamiento
  const [sortBy, setSortBy] = useState<string>('nombre');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (col: string) => {
    if (sortBy === col) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    setSortBy(col);
  }
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
  const [selectedCiudadId, setSelectedCiudadId] = useState<string>('__all__');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Client | null>(null);
  const [modoVista, setModoVista] = useState<'cards' | 'tabla'>('cards');

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad_id: '',
    estado: 'prospecto',
    nombre_contacto: '',
    celular_contacto: '',
    correo_contacto: '',
    fecha_alta: '',
    fecha_aceptacion: '',
    link_ubicacion: '',
    observaciones: ''
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
      fecha_aceptacion: '',
      link_ubicacion: '',
      observaciones: ''
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
          fecha_alta: formData.fecha_alta?.split('T')[0] || null,
          link_ubicacion: formData.link_ubicacion?.trim() || null
        });
        toast({
          title: "Cliente actualizado",
          description: "Los datos del cliente han sido actualizados correctamente.",
        });
      } else {
        await clientService.create({
          ...formData,
          ciudad_id: Number(formData.ciudad_id),
          fecha_alta: new Date().toISOString().split('T')[0], // <-- solo YYYY-MM-DD
          link_ubicacion: formData.link_ubicacion?.trim() || null
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
      fecha_aceptacion: cliente.fecha_aceptacion || '',
      link_ubicacion: cliente.link_ubicacion || '',
      observaciones: cliente.observaciones || ''
    });
    setIsDialogOpen(true);
  };

  let clientesFiltrados = clientes
    .filter(cliente => {
      const coincideTexto = (cliente.nombre || '').toLowerCase().includes(searchText.toLowerCase()) ||
                           (cliente.correo_contacto || '').toLowerCase().includes(searchText.toLowerCase());
      const coincideCiudad = selectedCiudadId === '__all__' || String(cliente.ciudad_id) === selectedCiudadId;
      return coincideTexto && coincideCiudad;
    })
  .sort((a, b) => {
    if (sortBy === 'nombre') return a.nombre.localeCompare(b.nombre);
    if (sortBy === 'direccion') return a.direccion.localeCompare(b.direccion);
    if (sortBy === 'ciudad') return String(ciudades.find(c => c.id === a.ciudad_id)?.ciudad || a.ciudad_id).localeCompare(String(ciudades.find(c => c.id === b.ciudad_id)?.ciudad || b.ciudad_id));
    if (sortBy === 'estado') return a.estado.localeCompare(b.estado);
    if (sortBy === 'nombre_contacto') return (a.nombre_contacto || '').localeCompare(b.nombre_contacto || '');
    if (sortBy === 'celular_contacto') return (a.celular_contacto || '').localeCompare(b.celular_contacto || '');
    if (sortBy === 'correo_contacto') return (a.correo_contacto || '').localeCompare(b.correo_contacto || '');
    if (sortBy === 'fecha_alta') return (a.fecha_alta || '').localeCompare(b.fecha_alta || '');
    if (sortBy === 'fecha_aceptacion') return (a.fecha_aceptacion || '').localeCompare(b.fecha_aceptacion || '');
    if (sortBy === 'link_ubicacion') return (a.link_ubicacion || '').localeCompare(b.link_ubicacion || '');
    if (sortBy === 'observaciones') return (a.observaciones || '').localeCompare(b.observaciones || '');
    return 0;
  });

  if (sortDirection === 'desc') clientesFiltrados = clientesFiltrados.reverse();

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
              <div className="space-y-2">
                <Label>Link ubicación</Label>
                <Input
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={formData.link_ubicacion}
                  onChange={e => setFormData({ ...formData, link_ubicacion: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Observaciones</Label>
                <Textarea
                  placeholder="Observaciones internas, notas, etc."
                  value={formData.observaciones}
                  onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                  rows={2}
                />
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
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
            <Input
              placeholder="Buscar cliente o correo..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="mb-2 md:mb-0"
            />
            <Select
              value={selectedCiudadId}
              onValueChange={setSelectedCiudadId}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por ciudad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todas las ciudades</SelectItem>
                {ciudades.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.ciudad}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Toggle de vista */}
      <div className="flex items-center gap-2 mb-4">
        <button
          className={`p-1 rounded ${modoVista === 'cards' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
          title="Vista Cards"
          onClick={() => setModoVista('cards')}
        >
          <Users className="w-5 h-5" />
        </button>
        <button
          className={`p-1 rounded ${modoVista === 'tabla' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
          title="Vista Tabla"
          onClick={() => setModoVista('tabla')}
        >
          {/* Table icon SVG */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M9 21V3"/></svg>
        </button>
      </div>

      {modoVista === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {clientesFiltrados.map(cliente => (
            <Card key={cliente.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    {cliente.nombre}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${getGrupoColor(cliente.estado)}`}>{cliente.estado.charAt(0).toUpperCase() + cliente.estado.slice(1)}</span>
                  </CardTitle>
                  <CardDescription className="text-gray-500 text-sm mt-1">{cliente.direccion}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => editarCliente(cliente)}
                    className="text-blue-600 hover:bg-blue-50"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:bg-red-50"
                    title="Eliminar"
                    onClick={async () => {
                      if (window.confirm(`¿Seguro que deseas eliminar a ${cliente.nombre}?`)) {
                        try {
                          await clientService.remove(cliente.id);
                          const data = await clientService.getAll();
                          setClientes(Array.isArray(data) ? data : []);
                          toast({ title: 'Cliente eliminado', description: 'El cliente fue eliminado correctamente.' });
                        } catch (err: any) {
                          toast({ title: 'Error al eliminar', description: err?.message || 'No se pudo eliminar el cliente.' });
                        }
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m5 0H6" /></svg>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex flex-wrap gap-x-6 gap-y-1">
                    <span><strong>Ciudad:</strong> {ciudades.find(c => c.id === cliente.ciudad_id)?.ciudad || cliente.ciudad_id}</span>
                    <span><strong>Contacto:</strong> {cliente.nombre_contacto || '—'}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1">
                    <span><strong>Celular:</strong> {cliente.celular_contacto || '—'}</span>
                    <span><strong>Correo:</strong> {cliente.correo_contacto || '—'}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1">
                    <span><strong>Fecha alta:</strong> {cliente.fecha_alta || '—'}</span>
                    <span><strong>Fecha aceptación:</strong> {cliente.fecha_aceptacion || '—'}</span>
                  </div>
                  {cliente.link_ubicacion && (
                    <div className="flex flex-wrap gap-x-6 gap-y-1">
                      <span><strong>Ubicación:</strong> <a href={cliente.link_ubicacion} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver ubicación</a></span>
                    </div>
                  )}
                  {cliente.observaciones && (
                    <div className="flex flex-wrap gap-x-6 gap-y-1">
                      <span><strong>Observaciones:</strong> {cliente.observaciones}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-green-100">
                <th className="px-3 py-2 border cursor-pointer select-none" onClick={() => handleSort('nombre')}>Nombre {sortBy === 'nombre' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
                <th className="px-3 py-2 border cursor-pointer select-none" onClick={() => handleSort('direccion')}>Dirección {sortBy === 'direccion' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
                <th className="px-3 py-2 border cursor-pointer select-none" onClick={() => handleSort('ciudad')}>Ciudad {sortBy === 'ciudad' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
                <th className="px-3 py-2 border cursor-pointer select-none" onClick={() => handleSort('estado')}>Estado {sortBy === 'estado' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
                <th className="px-3 py-2 border cursor-pointer select-none" onClick={() => handleSort('nombre_contacto')}>Contacto {sortBy === 'nombre_contacto' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
                <th className="px-3 py-2 border cursor-pointer select-none" onClick={() => handleSort('celular_contacto')}>Celular {sortBy === 'celular_contacto' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
                <th className="px-3 py-2 border cursor-pointer select-none" onClick={() => handleSort('correo_contacto')}>Correo {sortBy === 'correo_contacto' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
                <th className="px-3 py-2 border cursor-pointer select-none" onClick={() => handleSort('fecha_alta')}>Fecha alta {sortBy === 'fecha_alta' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
                <th className="px-3 py-2 border cursor-pointer select-none" onClick={() => handleSort('fecha_aceptacion')}>Fecha aceptación {sortBy === 'fecha_aceptacion' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
                <th className="px-3 py-2 border cursor-pointer select-none" onClick={() => handleSort('link_ubicacion')}>Ubicación {sortBy === 'link_ubicacion' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
                <th className="px-3 py-2 border cursor-pointer select-none" onClick={() => handleSort('observaciones')}>Observaciones {sortBy === 'observaciones' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
                <th className="px-3 py-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map(cliente => (
                <tr key={cliente.id} className="hover:bg-green-50">
                  <td className="px-3 py-2 border font-semibold">{cliente.nombre}</td>
                  <td className="px-3 py-2 border">{cliente.direccion}</td>
                  <td className="px-3 py-2 border">{ciudades.find(c => c.id === cliente.ciudad_id)?.ciudad || cliente.ciudad_id}</td>
                  <td className="px-3 py-2 border">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getGrupoColor(cliente.estado)}`}>{cliente.estado.charAt(0).toUpperCase() + cliente.estado.slice(1)}</span>
                  </td>
                  <td className="px-3 py-2 border">{cliente.nombre_contacto || '—'}</td>
                  <td className="px-3 py-2 border">{cliente.celular_contacto || '—'}</td>
                  <td className="px-3 py-2 border">{cliente.correo_contacto || '—'}</td>
                  <td className="px-3 py-2 border">{cliente.fecha_alta || '—'}</td>
                  <td className="px-3 py-2 border">{cliente.fecha_aceptacion || '—'}</td>
                  <td className="px-3 py-2 border">
                    {cliente.link_ubicacion ? (
                      <a href={cliente.link_ubicacion} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver ubicación</a>
                    ) : '—'}
                  </td>
                  <td className="px-3 py-2 border">{cliente.observaciones || '—'}</td>
                  <td className="px-3 py-2 border flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => editarCliente(cliente)}
                      className="text-blue-600 hover:bg-blue-50"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:bg-red-50"
                      title="Eliminar"
                      onClick={async () => {
                        if (window.confirm(`¿Seguro que deseas eliminar a ${cliente.nombre}?`)) {
                          try {
                            await clientService.remove(cliente.id);
                            const data = await clientService.getAll();
                            setClientes(Array.isArray(data) ? data : []);
                            toast({ title: 'Cliente eliminado', description: 'El cliente fue eliminado correctamente.' });
                          } catch (err: any) {
                            toast({ title: 'Error al eliminar', description: err?.message || 'No se pudo eliminar el cliente.' });
                          }
                        }
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m5 0H6" /></svg>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {clientesFiltrados.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron clientes
            </h3>
            <p className="text-gray-600">
              {searchText
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
