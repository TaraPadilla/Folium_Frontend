import React, { useEffect, useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ClientService, Client } from '@/services/api/ClientService';
import { Plus } from 'lucide-react';

interface SeleccionarClienteDialogProps {
  clienteSeleccionado: Client | null;
  onSeleccionar: (cliente: Client) => void;
  onCrearNuevo: () => void;
}

const SeleccionarClienteDialog: React.FC<SeleccionarClienteDialogProps> = ({ clienteSeleccionado, onSeleccionar, onCrearNuevo }) => {
  const [clientes, setClientes] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    new ClientService().getAll().then(setClientes);
  }, []);

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mb-4 w-full justify-between">
          {clienteSeleccionado ? (
            <span>Cliente: <b>{clienteSeleccionado.nombre}</b></span>
          ) : (
            <span>Seleccionar cliente...</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Selecciona un cliente</DialogTitle>
          <DialogDescription>Busca y selecciona un cliente existente, o crea uno nuevo.</DialogDescription>
        </DialogHeader>
        <input
          type="text"
          className="border p-2 rounded w-full mb-2"
          placeholder="Buscar cliente por nombre..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <div className="max-h-60 overflow-y-auto mb-4">
          {clientesFiltrados.length === 0 && (
            <div className="text-gray-500 text-center py-4">No hay clientes encontrados.</div>
          )}
          {clientesFiltrados.map(cliente => (
            <div
              key={cliente.id}
              className={`p-2 rounded cursor-pointer hover:bg-green-100 ${clienteSeleccionado?.id === cliente.id ? 'bg-green-200' : ''}`}
              onClick={() => {
                onSeleccionar(cliente);
                setOpen(false);
              }}
            >
              {cliente.nombre}
            </div>
          ))}
        </div>
        <Button variant="default" className="w-full" onClick={() => { setOpen(false); onCrearNuevo(); }}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SeleccionarClienteDialog;
