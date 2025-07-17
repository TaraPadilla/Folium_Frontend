import React, { useEffect, useState } from 'react';
import { PlanSeleccionadoService } from '@/services/api/PlanSeleccionadoService';
import { PlanTareaSeleccionadaService } from '@/services/api/PlanTareaSeleccionadaService';
import { Button } from '@/components/ui/button';

// Asumimos que ya existe un servicio para Tipo de Servicio:
import { PlanMantenimiento } from '@/services/api/PlanMantenimientoService';

export interface Tarea {
  id: number;
  nombre: string;
  plan_id: number;
  tipo: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  incluida?: boolean;
  visible_para_encargado?: boolean;
}

export interface PlanConTareas extends Omit<PlanMantenimiento, 'createdAt' | 'updatedAt' | 'deletedAt'> {
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  tareas: Tarea[];
}

interface SeleccionarPlanConTareasProps {
  planes: PlanConTareas[];
  onPlanSeleccionado?: (plan: PlanConTareas) => void;
  onPlanesAgregadosChange?: (planes: Array<{plan: PlanConTareas, tareas: Tarea[]}>) => void;
}

const SeleccionarPlanConTareas: React.FC<SeleccionarPlanConTareasProps> = ({ planes, onPlanSeleccionado, onPlanesAgregadosChange }) => {
  const [planId, setPlanId] = useState<number | null>(null);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [planesAgregados, setPlanesAgregados] = useState<Array<{plan: PlanConTareas, tareas: Tarea[]}>>([]);

  useEffect(() => {
    if (planId) {
      const plan = planes.find(p => p.id === planId);
      if (plan) {
        // Inicializar los campos incluida y visible_para_encargado en true por defecto
        const tareasConFlags = plan.tareas.map(t => ({ ...t, incluida: true, visible_para_encargado: true }));
        setTareas(tareasConFlags);
        if (onPlanSeleccionado) onPlanSeleccionado(plan);
      } else {
        setTareas([]);
      }
    } else {
      setTareas([]);
    }
  }, [planId, planes, onPlanSeleccionado]);

  const handleCheckboxChange = (tareaId: number, field: 'incluida' | 'visible_para_encargado', value: boolean) => {
    setTareas(prev => prev.map(t => t.id === tareaId ? { ...t, [field]: value } : t));
  };

  const handleEliminarTarea = (tareaId: number) => {
    setTareas(prev => prev.filter(t => t.id !== tareaId));
  };

  const handleAgregarPlan = () => {
    if (!planId) return;
    // No permitir duplicados
    if (planesAgregados.some(pa => pa.plan.id === planId)) return;
    const plan = planes.find(p => p.id === planId);
    if (plan) {
      // Agregar todas las tareas, manteniendo el valor de 'incluida'
      const nuevosPlanes = [...planesAgregados, { plan, tareas }];
      setPlanesAgregados(nuevosPlanes);
      if (onPlanesAgregadosChange) onPlanesAgregadosChange(nuevosPlanes);
      setPlanId(null);
      setTareas([]);
    }
  };

  const handleEliminarPlanAgregado = (planIdAEliminar: number) => {
    const nuevosPlanes = planesAgregados.filter(pa => pa.plan.id !== planIdAEliminar);
    setPlanesAgregados(nuevosPlanes);
    if (onPlanesAgregadosChange) onPlanesAgregadosChange(nuevosPlanes);
  };

  // Deshabilitar planes ya agregados en el selector
  const planesDisponibles = planes.filter(
    p => !planesAgregados.some(pa => pa.plan.id === p.id)
  );

  return (
    <div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Selecciona un plan de mantenimiento:</label>
        <select
          className="border p-2 rounded"
          value={planId ?? ''}
          onChange={e => setPlanId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">-- Selecciona --</option>
          {planesDisponibles.map(plan => (
            <option key={plan.id} value={plan.id}>{plan.nombre}</option>
          ))}
        </select>
      </div>

      {tareas.length > 0 && (
        <>
          <table className="min-w-full table-auto border mb-4">
            <thead>
              <tr className="bg-green-100">
                <th className="px-4 py-2 border">Nombre de la tarea</th>
                <th className="px-4 py-2 border">Incluida</th>
                <th className="px-4 py-2 border">Visible para encargado</th>
                <th className="px-4 py-2 border">Acción</th>
              </tr>
            </thead>
            <tbody>
              {tareas.map(tarea => (
                <tr key={tarea.id} className="hover:bg-green-50">
                  <td className="px-4 py-2 border">{tarea.nombre}</td>
                  <td className="px-4 py-2 border text-center">
                    <input
                      type="checkbox"
                      checked={tarea.incluida ?? true}
                      onChange={e => handleCheckboxChange(tarea.id, 'incluida', e.target.checked)}
                    />
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <input
                      type="checkbox"
                      checked={tarea.visible_para_encargado ?? true}
                      onChange={e => handleCheckboxChange(tarea.id, 'visible_para_encargado', e.target.checked)}
                    />
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <Button variant="destructive" size="sm" onClick={() => handleEliminarTarea(tarea.id)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button
            variant="default"
            className="mb-6"
            onClick={handleAgregarPlan}
            disabled={!planId || tareas.length === 0}
          >
            Agregar este plan
          </Button>
        </>
      )}

      {planesAgregados.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-2">Planes agregados:</h3>
          {planesAgregados.map(({ plan, tareas }) => (
            <div key={plan.id} className="mb-6 border rounded p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{plan.nombre}</span>
                <Button variant="destructive" size="sm" onClick={() => handleEliminarPlanAgregado(plan.id)}>
                  Eliminar plan
                </Button>
              </div>
              <table className="min-w-full table-auto border">
                <thead>
                  <tr className="bg-green-50">
                    <th className="px-4 py-2 border">Tarea</th>
                    <th className="px-4 py-2 border">Incluida</th>
                    <th className="px-4 py-2 border">Visible para encargado</th>
                  </tr>
                </thead>
                <tbody>
                  {tareas.map(tarea => (
                    <tr key={tarea.id}>
                      <td className="px-4 py-2 border">{tarea.nombre}</td>
                      <td className="px-4 py-2 border text-center">{tarea.incluida ? 'Sí' : 'No'}</td>
                      <td className="px-4 py-2 border text-center">{tarea.visible_para_encargado ? 'Sí' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeleccionarPlanConTareas;
