import React, { useEffect, useState } from 'react';
import SeleccionarPlanConTareas from './SeleccionarPlanConTareas';
import { Button } from '@/components/ui/button';
// Suponiendo que tienes un servicio para obtener los planes
import type { PlanConTareas, Tarea } from './SeleccionarPlanConTareas';

// Simulación de fetch de planes (reemplaza por llamada real a tu servicio)
const fetchPlanesMantenimiento = async (): Promise<PlanConTareas[]> => {
  // Aquí deberías usar tu servicio real, esto es solo un mock
  return [
    {
      id: 1,
      nombre: 'MANTENIMIENTO BÁSICO CÉSPED',
      descripcion: 'MANTENIMIENTO BÁSICO CÉSPED',
      tareas: [
        {
          id: 2,
          nombre: 'Bordeado',
          plan_id: 1,
          tipo: 'predefinida'
        },
        {
          id: 3,
          nombre: 'Soplado de caminos y veredas',
          plan_id: 1,
          tipo: 'predefinida'
        }
      ]
    }
  ];
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
