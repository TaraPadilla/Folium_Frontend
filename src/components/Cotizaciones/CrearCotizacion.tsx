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

import { NegocioService } from '@/services/api/NegocioService';
import { useNavigate } from 'react-router-dom';

const CrearCotizacion: React.FC = () => {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState<PlanConTareas[]>([]);
  const [planSeleccionado, setPlanSeleccionado] = useState<PlanConTareas | null>(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Client | null>(null);
  const [mostrarCrearCliente, setMostrarCrearCliente] = useState(false);
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [planesAgregados, setPlanesAgregados] = useState<Array<{plan: PlanConTareas, tareas: Tarea[]}>>([]);
  const [guardandoCotizacion, setGuardandoCotizacion] = useState(false);
  const [consideraciones, setConsideraciones] = useState('');
  const [propuestaEconomica, setPropuestaEconomica] = useState('');

  const handleGuardarCotizacion = async () => {
    if (!clienteSeleccionado || planesAgregados.length === 0) {
      alert('Debes seleccionar un cliente y al menos un plan');
      return;
    }
    setGuardandoCotizacion(true);
    try {
      const negocioService = new NegocioService();
      // Construye el objeto cotizacion sin campos de control ni id
      const cotizacion = {
        cliente_id: clienteSeleccionado.id,
        consideraciones,
        propuesta_economica: propuestaEconomica,
        // Agrega aquí otros campos requeridos por Cotizacion (ejemplo: fecha, descripcion, etc.)
      } as any;
      const cotizacionId = await negocioService.guardarCotizacionConPlanesYtareas(cotizacion, planesAgregados);
      alert('Cotización guardada exitosamente con id: ' + cotizacionId);
      navigate('/cotizaciones'); // Redirige al listado de cotizaciones
    } catch (e) {
      alert('Error al guardar la cotización');
    } finally {
      setGuardandoCotizacion(false);
    }
  };


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
      {/* Paso 2: Consideraciones y Propuesta económica */}
      {clienteSeleccionado && (
        <>
          <div className="mb-4">
            <label className="block font-semibold mb-1" htmlFor="consideraciones">Consideraciones</label>
            <textarea
              id="consideraciones"
              className="w-full border rounded px-3 py-2 min-h-[60px]"
              placeholder="Escribe aquí cualquier consideración relevante para la cotización..."
              value={consideraciones}
              onChange={e => setConsideraciones(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1" htmlFor="propuesta_economica">Propuesta económica</label>
            <textarea
              id="propuesta_economica"
              className="w-full border rounded px-3 py-2 min-h-[60px]"
              placeholder="Escribe aquí la propuesta económica, condiciones de pago, etc..."
              value={propuestaEconomica}
              onChange={e => setPropuestaEconomica(e.target.value)}
            />
          </div>
          <SeleccionarPlanConTareas
            planes={planes}
            onPlanSeleccionado={setPlanSeleccionado}
            onPlanesAgregadosChange={setPlanesAgregados}
          />
        </>
      )}
      {/* Paso 3: Guardar cotización, solo si hay cliente */}
      {clienteSeleccionado && (
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => setMostrarPreview(true)}>Previsualizar</Button>
          <Button
            variant="default"
            onClick={handleGuardarCotizacion}
            disabled={guardandoCotizacion}
          >
            {guardandoCotizacion ? 'Guardando...' : 'Guardar Cotización'}
          </Button>
        </div>
      )}
      {/* Modal de previsualización PDF */}
      {mostrarPreview && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-8 rounded shadow-lg max-w-2xl w-full relative overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-4">Previsualización de Cotización</h3>
            <div className="mb-4">
              <div className="mb-2"><b>Cliente:</b> {clienteSeleccionado?.nombre}</div>
              <div className="mb-2"><b>Dirección:</b> {clienteSeleccionado?.direccion}</div>
              <div className="mb-2"><b>Contacto:</b> {clienteSeleccionado?.nombre_contacto} ({clienteSeleccionado?.celular_contacto})</div>
            </div>
            <div>
              <b>Planes y Tareas:</b>
              {planesAgregados && planesAgregados.length > 0 ? (
                <div className="mt-2">
                  {planesAgregados.map(({ plan, tareas }) => (
                    <div key={plan.id} className="mb-4">
                      <div className="font-semibold">{plan.nombre}</div>
                      <table className="min-w-full table-auto border text-xs mt-1">
                        <thead>
                          <tr className="bg-green-50">
                            <th className="px-2 py-1 border">Tarea</th>
                            <th className="px-2 py-1 border">Incluida</th>
                            <th className="px-2 py-1 border">Observaciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tareas.map(tarea => (
                            <tr key={tarea.id}>
                              <td className="px-2 py-1 border">{tarea.nombre}</td>
                              <td className="px-2 py-1 border text-center">{tarea.incluida ? 'Sí' : 'No'}</td>
                              <td className="px-2 py-1 border">{tarea.observaciones ?? ''}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 text-sm text-gray-700">No hay planes seleccionados.</div>
              )}
            </div>
            <Button variant="outline" className="absolute top-4 right-4" onClick={() => setMostrarPreview(false)}>Cerrar</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearCotizacion;
