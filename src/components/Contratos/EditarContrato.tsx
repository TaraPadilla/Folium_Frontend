import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContratoService } from '@/services/api/ContratoService';
import { Equipo, EquipoService } from '@/services/api/EquipoService';
import { Cotizacion, CotizacionService, PlanSeleccionadoConTareas } from '@/services/api/CotizacionService';
import { NegocioService } from '@/services/api/NegocioService';

const frecuencias = [
  { value: 'mensual', label: 'Mensual' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'puntual', label: 'Puntual' },
];

const diasSemana = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
];

const EditarContrato: React.FC = () => {
  const { contratoId } = useParams<{ contratoId: string }>();
  const navigate = useNavigate();
  const [contrato, setContrato] = useState<any>(null);
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [frecuencia, setFrecuencia] = useState('mensual');
  const [equipoSeleccionado, setEquipoSeleccionado] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [diaVisita, setDiaVisita] = useState('Lunes');
  const [estado, setEstado] = useState('activo');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [planesSeleccionados, setPlanesSeleccionados] = useState<PlanSeleccionadoConTareas[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const contratoService = new ContratoService();
        const equipoService = new EquipoService();
        const cotizacionService = new CotizacionService();
        const contratoData = await contratoService.getById(Number(contratoId));
        setContrato(contratoData);
        setFrecuencia(contratoData.frecuencia);
        setEquipoSeleccionado(contratoData.equipo_id.toString());
        setFechaInicio(contratoData.fecha_inicio);
        setFechaFin(contratoData.fecha_fin);
        setDiaVisita(contratoData.dia_visita);
        setEstado(contratoData.estado);
        // Usar los planes y tareas seleccionados directamente del contrato
        const planesFormateados = (contratoData.planes_seleccionados || []).map((plan: any) => ({
          ...plan,
          precio_referencial: Number(plan.precio_referencial),
          tareas_seleccionadas: (plan.tareas_seleccionadas || []).map((tarea: any) => ({
            ...tarea,
            incluida: Boolean(tarea.incluida),
            visible_para_encargado: Boolean(tarea.visible_para_encargado),
          })),
        }));
        setPlanesSeleccionados(planesFormateados);
        const equiposList = await equipoService.getAll();
        setEquipos(equiposList);
      } catch (e) {
        // Manejar error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [contratoId]);

  function puedeGuardarContrato() {
    return !!(contrato && equipoSeleccionado && fechaInicio && fechaFin);
  }

  async function handleActualizarContrato() {
    if (!puedeGuardarContrato()) return;
    setSaving(true);
    setSuccessMsg(null);
    try {
      // Actualiza solo los datos principales del contrato
      const contratoService = new (await import('@/services/api/ContratoService')).ContratoService();
      const updatedContrato = {
        ...contrato,
        equipo_id: Number(equipoSeleccionado),
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        frecuencia,
        dia_visita: diaVisita,
        estado,
      };
      await contratoService.update(updatedContrato.id, updatedContrato);

      // Actualiza planes y tareas seleccionadas si cambiaron
      // (esto puede ser expandido según la lógica de tu backend y modelos)
      const planSeleccionadoService = new (await import('@/services/api/PlanSeleccionadoService')).PlanSeleccionadoService();
      const planTareaSeleccionadaService = new (await import('@/services/api/PlanTareaSeleccionadaService')).PlanTareaSeleccionadaService();
      for (const plan of planesSeleccionados) {
        if (plan.id) {
          // Corrige precio_referencial a number
          const planToUpdate = {
            ...plan,
            precio_referencial: plan.precio_referencial !== undefined ? Number(plan.precio_referencial) : undefined,
          };
          await planSeleccionadoService.update(plan.id, planToUpdate);
          if (plan.tareas_seleccionadas) {
            for (const tarea of plan.tareas_seleccionadas) {
              if (tarea.id) {
                // Corrige incluida a boolean
                const tareaToUpdate = {
                  ...tarea,
                  incluida: tarea.incluida !== undefined ? Boolean(tarea.incluida) : undefined,
                  visible_para_encargado: tarea.visible_para_encargado !== undefined ? Boolean(tarea.visible_para_encargado) : undefined,
                };
                await planTareaSeleccionadaService.update(tarea.id, tareaToUpdate);
              }
            }
          }
        }
      }
      setSuccessMsg('¡Contrato actualizado exitosamente!');
    } catch (e: any) {
      if (e && e.response && e.response.data && e.response.data.message) {
        setSuccessMsg('Error: ' + e.response.data.message);
      } else {
        setSuccessMsg('Error al actualizar el contrato');
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Cargando datos...</div>;
  if (!contrato) return <div className="p-8 text-center text-red-600">No se pudo cargar el contrato.</div>;

  return (
    <div className="container mx-auto max-w-4xl bg-white p-6 rounded shadow mt-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Editar Contrato</h1>
        <button
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded shadow"
          onClick={() => navigate(-1)}
        >Volver</button>
      </div>
      {successMsg && (
        <div className="mb-4 text-center text-green-700 bg-green-100 p-2 rounded">
          {successMsg}
        </div>
      )}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleActualizarContrato();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-semibold mb-1">Equipo</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={equipoSeleccionado}
              onChange={e => setEquipoSeleccionado(e.target.value)}
              required
            >
              <option value="">Seleccione equipo</option>
              {equipos.map(e => (
                <option key={e.id} value={e.id}>{e.nombre || e.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Frecuencia</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={frecuencia}
              onChange={e => setFrecuencia(e.target.value)}
              required
            >
              {frecuencias.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Fecha inicio</label>
            <input
              type="date"
              className="border rounded px-3 py-2 w-full"
              value={fechaInicio}
              onChange={e => setFechaInicio(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Fecha fin</label>
            <input
              type="date"
              className="border rounded px-3 py-2 w-full"
              value={fechaFin}
              onChange={e => setFechaFin(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Día visita</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={diaVisita}
              onChange={e => setDiaVisita(e.target.value)}
              required
            >
              {diasSemana.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Estado</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={estado}
              onChange={e => setEstado(e.target.value)}
              required
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>
        </div>
        {/* Planes y tareas */}
        <div className="bg-gray-100 p-4 rounded mb-6">
          <h2 className="text-lg font-semibold mb-2">Planes y tareas seleccionadas</h2>
          {planesSeleccionados && planesSeleccionados.length > 0 ? (
            <div>
              {planesSeleccionados.map((plan: PlanSeleccionadoConTareas) => (
                <div key={plan.id} className="mb-4">
                  <div className="font-semibold">{plan.plan?.nombre || plan.nombre_personalizado}</div>
                  <table className="min-w-full table-auto border text-xs mt-1">
                    <thead>
                      <tr className="bg-green-50">
                        <th className="px-2 py-1 border">Tarea</th>
                        <th className="px-2 py-1 border">Visible</th>
                        <th className="px-2 py-1 border">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.tareas_seleccionadas?.map((tarea, tareaIdx) => (
                        <tr key={tarea.id}>
                          <td className="px-2 py-1 border">{tarea.tarea?.nombre || tarea.tarea_id}</td>
                          <td className="px-2 py-1 border text-center">
                            <input
                              type="checkbox"
                              checked={!!tarea.visible_para_encargado}
                              onChange={e => {
                                const newValue = e.target.checked ? 1 : 0;
                                setPlanesSeleccionados(planes => planes.map(p => {
                                  if (p.id !== plan.id) return p;
                                  return {
                                    ...p,
                                    tareas_seleccionadas: p.tareas_seleccionadas?.map((t, idx) =>
                                      idx === tareaIdx ? { ...t, visible_para_encargado: newValue } : t
                                    )
                                  };
                                }));
                              }}
                            />
                          </td>
                          <td className="px-2 py-1 border text-center">
                            <input
                              type="text"
                              className="border rounded px-1 py-0.5 w-full"
                              value={tarea.observaciones || ''}
                              onChange={e => {
                                const newValue = e.target.value;
                                setPlanesSeleccionados(planes => planes.map(p => {
                                  if (p.id !== plan.id) return p;
                                  return {
                                    ...p,
                                    tareas_seleccionadas: p.tareas_seleccionadas?.map((t, idx) =>
                                      idx === tareaIdx ? { ...t, observaciones: newValue } : t
                                    )
                                  };
                                }));
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-600">No hay planes seleccionados.</div>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow disabled:opacity-50"
            disabled={saving || !puedeGuardarContrato()}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarContrato;
