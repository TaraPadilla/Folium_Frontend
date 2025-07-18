import React, { useEffect, useState } from 'react';
import { Cotizacion, CotizacionService } from '@/services/api/CotizacionService';
import { PDFDownloadLink } from '@react-pdf/renderer';
import CotizacionPdf from '../Pdf/CotizacionPdf';
import { useNavigate } from 'react-router-dom';
import { EyeIcon } from 'lucide-react';

interface CotizacionRowProps {
  cotizacion: Cotizacion;
}

const CotizacionRow: React.FC<CotizacionRowProps> = ({ cotizacion }) => {
  const [pdfData, setPdfData] = React.useState<any | null>(null);
  const [loadingPdf, setLoadingPdf] = React.useState(false);
  const [showLink, setShowLink] = React.useState(false);
  const navigate = useNavigate();

  const handlePdfClick = async () => {
    setLoadingPdf(true);
    setShowLink(false);
    try {
      // Llama al servicio de cotizaciones para obtener la cotización completa getById
      const cotizacionCompleta = await cotizacionService.getById(cotizacion.id);
      setPdfData(cotizacionCompleta);
      setShowLink(true);
    } catch (e) {
      alert('No se pudo obtener la cotización completa');
    } finally {
      setLoadingPdf(false);
    }
  };

  // Estado con colores
  const estadoColor = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    aceptada: 'bg-green-100 text-green-800',
    rechazada: 'bg-red-100 text-red-800',
    enviada: 'bg-blue-100 text-blue-800',
  };
  const estado = cotizacion.estado || 'pendiente';

  // Modal de previsualización
  const [showPreview, setShowPreview] = React.useState(false);
  const [cotizacionCompleta, setCotizacionCompleta] = React.useState<any | null>(null);
  const [loadingPreview, setLoadingPreview] = React.useState(false);

  const handlePreview = async () => {
    setShowPreview(true);
    setLoadingPreview(true);
    try {
      const data = await cotizacionService.getById(cotizacion.id);
      setCotizacionCompleta(data);
    } catch {
      setCotizacionCompleta(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <>
      <tr className="hover:bg-green-50">
        <td className="px-4 py-2 border">{cotizacion.id}</td>
        <td className="px-4 py-2 border">{cotizacion.cliente?.nombre || '-'}</td>
        <td className="px-4 py-2 border">
          <select
            className={`border rounded px-2 py-1 text-xs font-bold ${estadoColor[estado] || 'bg-gray-100 text-gray-800'}`}
            value={estado}
            onChange={async (e) => {
              const nuevoEstado = e.target.value;
              if (nuevoEstado === estado) return;
              if (window.confirm(`¿Seguro que quieres cambiar el estado de la cotización a "${nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1)}"?`)) {
                try {
                  await cotizacionService.actualizarEstado(cotizacion.id, nuevoEstado);
                  // Si tienes un método para recargar la lista, llama aquí. Si no, actualiza el estado localmente:
                  if (cotizacion.estado !== undefined) cotizacion.estado = nuevoEstado;
                  // Si usas algún state global o necesitas recargar, ajusta aquí
                  window.localStorage.setItem('cotizacion_toast', 'Estado actualizado correctamente');
                  window.location.reload(); // Forzar recarga para reflejar
                } catch {
                  if (window && window.localStorage) {
  window.localStorage.setItem('cotizacion_toast', 'No se pudo actualizar el estado');
}

                }
              }
            }}
          >
            <option value="pendiente">Pendiente</option>
            <option value="enviada">Enviada</option>
            <option value="aceptada">Aceptada</option>
            <option value="descartada">Descartada</option>
          </select>
        </td>
        <td className="px-4 py-2 border">{cotizacion.fecha_envio}</td>
        <td className="px-4 py-2 border flex gap-1">
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-2 rounded text-xs"
            title="Editar"
            // onClick: funcionalidad futura
          >Editar</button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded text-xs"
            title="Eliminar"
            // onClick: funcionalidad futura
          >Eliminar</button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-2 rounded text-xs"
            onClick={() => navigate(`/cotizaciones/${cotizacion.id}/pdf`)}
            title="Ver PDF"
          >PDF</button>
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-semibold py-1 px-2 rounded text-xs flex items-center gap-1"
            onClick={handlePreview}
            title="Previsualizar"
          >
            <EyeIcon className="w-4 h-4 inline" />
          </button>
        </td>
      </tr>
      {/* Modal de previsualización */}
      {showPreview && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-8 rounded shadow-lg max-w-2xl w-full relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black font-bold text-lg"
              onClick={() => setShowPreview(false)}
              aria-label="Cerrar"
            >×</button>
            <h3 className="text-xl font-bold mb-4">Previsualización de Cotización #{cotizacion.id}</h3>
            {loadingPreview && <div>Cargando...</div>}
            {!loadingPreview && cotizacionCompleta && (
              <div>
                <div className="mb-2"><b>Cliente:</b> {cotizacionCompleta.cliente?.nombre}</div>
                <div className="mb-2"><b>Dirección:</b> {cotizacionCompleta.cliente?.direccion}</div>
                <div className="mb-2"><b>Contacto:</b> {cotizacionCompleta.cliente?.nombre_contacto} ({cotizacionCompleta.cliente?.celular_contacto})</div>
                <div className="mb-2"><b>Estado:</b> {cotizacionCompleta.estado}</div>
                {/* Puedes agregar más detalles aquí si lo deseas */}
                <div className="mt-4">
                  <b>Planes y Tareas:</b>
                  {cotizacionCompleta.planes_seleccionados && cotizacionCompleta.planes_seleccionados.length > 0 ? (
                    <div className="mt-2">
                      {cotizacionCompleta.planes_seleccionados.map((plan: any) => (
                        <div key={plan.id} className="mb-4">
                          <div className="font-semibold">{plan.plan?.nombre || plan.nombre_personalizado}</div>
                          <table className="min-w-full table-auto border text-xs mt-1">
                            <thead>
                              <tr className="bg-green-50">
                                <th className="px-2 py-1 border">Tarea</th>
                                <th className="px-2 py-1 border">Incluida</th>
                                <th className="px-2 py-1 border">Observaciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {plan.tareas_seleccionadas.map((tarea: any) => (
                                <tr key={tarea.id}>
                                  <td className="px-2 py-1 border">{tarea.tarea?.nombre || tarea.nombre || tarea.tarea_nombre}</td>
                                  <td className="px-2 py-1 border text-center">{tarea.incluida ? 'Sí' : 'No'}</td>
                                  <td className="px-2 py-1 border text-center">{tarea.observaciones || ''}</td>
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
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const cotizacionService = new CotizacionService();

const CotizacionesList: React.FC = () => {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cotizacionService.getAll()
      .then(setCotizaciones)
      .catch(() => setError('No se pudieron cargar las cotizaciones.'))
      .finally(() => setLoading(false));
  }, []);

  // Filtros (deben ir ANTES de cualquier return o condicional para evitar advertencias de React)
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroCliente, setFiltroCliente] = useState<string>('');

  if (loading) return <div>Cargando cotizaciones...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  // Obtener estados únicos presentes en la data
  const estadosDisponibles = Array.from(new Set(cotizaciones.map(c => c.estado).filter(Boolean)));

  // Filtrar cotizaciones
  const cotizacionesFiltradas = cotizaciones.filter(c => {
    const matchEstado = !filtroEstado || c.estado === filtroEstado;
    const matchCliente = !filtroCliente || (c.cliente?.nombre || '').toLowerCase().includes(filtroCliente.toLowerCase());
    return matchEstado && matchCliente;
  });

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
        <h2 className="text-xl font-bold">Cotizaciones</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            className="border rounded px-2 py-1 text-sm"
            placeholder="Filtrar por cliente..."
            value={filtroCliente}
            onChange={e => setFiltroCliente(e.target.value)}
            style={{ minWidth: 180 }}
          />
          <select
            className="border rounded px-2 py-1 text-sm"
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            style={{ minWidth: 140 }}
          >
            <option value="">Todos los estados</option>
            {estadosDisponibles.map(estado => (
              <option key={estado} value={estado}>{estado.charAt(0).toUpperCase() + estado.slice(1)}</option>
            ))}
          </select>
          <NuevaCotizacionButton />
        </div>
      </div>
      <div style={{ overflowX: 'auto', maxHeight: 600 }} className="w-full">
        <table className="min-w-full table-auto border">
          <thead>
            <tr className="bg-green-100">
              <th className="px-4 py-2 border">Nro</th>
              <th className="px-4 py-2 border">Cliente</th>
              <th className="px-4 py-2 border">Estado</th>
              <th className="px-4 py-2 border">Fecha Envío</th>
              <th className="px-4 py-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cotizacionesFiltradas.map(c => (
              <CotizacionRow key={c.id} cotizacion={c} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const NuevaCotizacionButton: React.FC = () => {
  const navigate = useNavigate();
  return (
    <button
      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow"
      onClick={() => navigate('/cotizaciones/nueva')}
    >
      Nueva Cotización
    </button>
  );
};

export default CotizacionesList;
