import React, { useEffect, useState } from 'react';
import SeleccionarPlanConTareas from './SeleccionarPlanConTareas';
import { Button } from '@/components/ui/button';
// Suponiendo que tienes un servicio para obtener los planes
import type { PlanConTareas, Tarea } from './SeleccionarPlanConTareas';

import { PlanMantenimientoService } from '@/services/api/PlanMantenimientoService';

// Carga real de planes desde el backend
const fetchPlanesMantenimiento = async (): Promise<PlanConTareas[]> => {
  const service = new PlanMantenimientoService();
  const planes = await service.getAll();
  // Por ahora, cada plan viene sin tareas; luego se deben asociar tareas reales por plan
  return planes.map(plan => ({ ...plan, tareas: [] }));
};

const CrearCotizacion: React.FC = () => {
  const [planes, setPlanes] = useState<PlanConTareas[]>([]);
  const [planSeleccionado, setPlanSeleccionado] = useState<PlanConTareas | null>(null);

  useEffect(() => {
    fetchPlanesMantenimiento().then(setPlanes);
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Crear Nueva Cotización</h2>
      {/* Aquí podrías agregar selección de cliente prospecto, fechas, etc. */}
      <SeleccionarPlanConTareas planes={planes} onPlanSeleccionado={setPlanSeleccionado} />
      {/* Aquí podrías agregar otros pasos, como guardar cotización, etc. */}
      <div className="mt-6">
        <Button variant="default">Guardar Cotización</Button>
      </div>
    </div>
  );
};

export default CrearCotizacion;
