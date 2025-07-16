import React, { useEffect, useState } from 'react';
import SeleccionarPlanConTareas from './SeleccionarPlanConTareas';
import { Button } from '@/components/ui/button';
// Suponiendo que tienes un servicio para obtener los planes
import type { PlanConTareas, Tarea } from './SeleccionarPlanConTareas';

import { PlanMantenimientoService } from '@/services/api/PlanMantenimientoService';

import { TareaService } from '@/services/api/TareaService';

const fetchPlanesConTareas = async (): Promise<PlanConTareas[]> => {
  const planService = new PlanMantenimientoService();
  const tareaService = new TareaService();
  const [planes, tareas] = await Promise.all([
    planService.getAll(),
    tareaService.getAll()
  ]);
  // Asocia tareas a su plan correspondiente
  return planes.map(plan => ({
    ...plan,
    tareas: tareas.filter(t => t.plan_id === plan.id)
  }));
};

import SeleccionarClienteDialog from './SeleccionarClienteDialog';
import { Client } from '@/services/api/ClientService';

const CrearCotizacion: React.FC = () => {
  const [planes, setPlanes] = useState<PlanConTareas[]>([]);
  const [planSeleccionado, setPlanSeleccionado] = useState<PlanConTareas | null>(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Client | null>(null);
  const [mostrarCrearCliente, setMostrarCrearCliente] = useState(false);

  useEffect(() => {
    fetchPlanesConTareas().then(setPlanes);
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Crear Nueva Cotización</h2>
      {/* Paso 1: Selección de cliente */}
      <SeleccionarClienteDialog
        clienteSeleccionado={clienteSeleccionado}
        onSeleccionar={setClienteSeleccionado}
        onCrearNuevo={() => setMostrarCrearCliente(true)}
      />
      {/* Modal o integración futura para crear cliente */}
      {mostrarCrearCliente && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-50">
          <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Crear nuevo cliente</h3>
            <div className="text-gray-600 mb-4">(Integración con formulario de clientes próximamente)</div>
            <Button variant="outline" onClick={() => setMostrarCrearCliente(false)}>Cerrar</Button>
          </div>
        </div>
      )}
      {/* Paso 2: Selección de planes y tareas, solo si hay cliente */}
      {clienteSeleccionado && (
        <SeleccionarPlanConTareas planes={planes} onPlanSeleccionado={setPlanSeleccionado} />
      )}
      {/* Paso 3: Guardar cotización, solo si hay cliente */}
      {clienteSeleccionado && (
        <div className="mt-6">
          <Button variant="default">Guardar Cotización</Button>
        </div>
      )}
    </div>
  );
};

export default CrearCotizacion;
