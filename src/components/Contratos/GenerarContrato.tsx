import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Cotizacion, CotizacionService, PlanSeleccionadoConTareas } from '@/services/api/CotizacionService';
import { Equipo, EquipoService } from '@/services/api/EquipoService';
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

const GenerarContrato: React.FC = () => {
  const { cotizacionId } = useParams<{ cotizacionId: string }>();
  const navigate = useNavigate();
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [frecuencia, setFrecuencia] = useState('mensual');
  const [equipoSeleccionado, setEquipoSeleccionado] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [diaVisita, setDiaVisita] = useState('Lunes');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Validación de datos mínimos para guardar
  function puedeGuardarContrato() {
    return !!(cotizacion && equipoSeleccionado && fechaInicio && fechaFin);
  }

  // Lógica de guardado de contrato
  async function handleGuardarContrato() {
    if (!puedeGuardarContrato()) return;
    setSaving(true);
    setSuccessMsg(null);
    try {
      const negocioService = new NegocioService();
      const contrato = {
        cliente_id: cotizacion!.cliente_id,
        equipo_id: Number(equipoSeleccionado),
        cotizacion_id: cotizacion!.id,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        estado: 'activo',
        frecuencia,
        dia_visita: diaVisita,
      };
      await negocioService.guardarContratoConPlanesYtareas(
        contrato,
        cotizacion.planes_seleccionados.map(p => ({
          plan: p.plan,
          tareas: p.tareas_seleccionadas?.map(t => ({
            tarea_id: t.tarea_id,
            visible_para_encargado: t.visible_para_encargado,
            observaciones: t.observaciones,
            incluida: t.incluida ?? 1
          })) || []
        }))
      );
      setSuccessMsg('¡Contrato guardado exitosamente!');
    } catch (e: any) {
      if (e && e.response && e.response.data && e.response.data.message) {
        setSuccessMsg('Error: ' + e.response.data.message);
      } else {
        setSuccessMsg('Error al guardar el contrato');
      }
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cotizacionService = new CotizacionService();
        const equipoService = new EquipoService();
        const cotiz = await cotizacionService.getById(Number(cotizacionId));
        setCotizacion(cotiz);
        const equiposList = await equipoService.getAll();
        setEquipos(equiposList);
      } catch (e) {
        // Manejar error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cotizacionId]);

  if (loading) return <div className="p-8 text-center">Cargando datos...</div>;
  if (!cotizacion) return <div className="p-8 text-center text-red-600">No se pudo cargar la cotización.</div>;

  return (
    <div className="container mx-auto max-w-4xl bg-white p-6 rounded shadow mt-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Generar Contrato</h1>
        <div className="flex gap-2">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
            onClick={handleGuardarContrato}
            disabled={saving || !puedeGuardarContrato()}
          >
            {saving ? 'Guardando...' : 'Guardar Contrato'}
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">Ejecutar Cronograma</button>
          <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded shadow" onClick={() => navigate(`/cotizaciones/${cotizacion.id}/editar`)}>Editar Presupuesto</button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded mb-4 flex flex-col gap-2">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold">Cliente</label>
            <div className="text-base">{cotizacion.cliente?.nombre || '-'}</div>
            <div className="text-xs text-gray-500">{cotizacion.cliente?.direccion || ''}</div>
            <div className="text-xs text-gray-500">Contacto: {cotizacion.cliente?.nombre_contacto || ''} {cotizacion.cliente?.celular_contacto ? `(${cotizacion.cliente.celular_contacto})` : ''}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold">Frecuencia</label>
            <select className="border rounded px-2 py-1" value={frecuencia} onChange={e => setFrecuencia(e.target.value)}>
              {frecuencias.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold">Día Visita</label>
            <select className="border rounded px-2 py-1" value={diaVisita} onChange={e => setDiaVisita(e.target.value)}>
              {diasSemana.map(dia => (
                <option key={dia} value={dia}>{dia}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold">Equipo</label>
            <select className="border rounded px-2 py-1" value={equipoSeleccionado} onChange={e => setEquipoSeleccionado(e.target.value)}>
              <option value="">Seleccione un equipo</option>
              {equipos.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold">Fecha Inicio</label>
            <input type="date" className="border rounded px-2 py-1" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold">Fecha Fin</label>
            <input type="date" className="border rounded px-2 py-1" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Previsualización de planes y tareas seleccionadas */}
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Planes y tareas seleccionadas</h2>
        {cotizacion.planes_seleccionados && cotizacion.planes_seleccionados.length > 0 ? (
          <div>
            {cotizacion.planes_seleccionados.map((plan: PlanSeleccionadoConTareas) => (
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
                              setCotizacion(cot => {
                                if (!cot) return cot;
                                const updated = { ...cot };
                                updated.planes_seleccionados = updated.planes_seleccionados?.map(p => {
                                  if (p.id !== plan.id) return p;
                                  return {
                                    ...p,
                                    tareas_seleccionadas: p.tareas_seleccionadas?.map((t, idx) =>
                                      idx === tareaIdx ? { ...t, visible_para_encargado: newValue } : t
                                    )
                                  };
                                });
                                return updated;
                              });
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
                              setCotizacion(cot => {
                                if (!cot) return cot;
                                const updated = { ...cot };
                                updated.planes_seleccionados = updated.planes_seleccionados?.map(p => {
                                  if (p.id !== plan.id) return p;
                                  return {
                                    ...p,
                                    tareas_seleccionadas: p.tareas_seleccionadas?.map((t, idx) =>
                                      idx === tareaIdx ? { ...t, observaciones: newValue } : t
                                    )
                                  };
                                });
                                return updated;
                              });
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
    </div>
  );
};

export default GenerarContrato;
