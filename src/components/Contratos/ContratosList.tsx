import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Contrato, ContratoService } from '@/services/api/ContratoService';
import { CotizacionService } from '@/services/api/CotizacionService';
import { EquipoService } from '@/services/api/EquipoService';
import { Client, ClientService } from '@/services/api/ClientService';
import VisitaService from '@/services/api/VisitaService';


const ContratosList: React.FC = () => {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [clientes, setClientes] = useState<Record<number, Client>>({});
  const [equipos, setEquipos] = useState<Record<number, any>>({});
  const [cotizaciones, setCotizaciones] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  // Filtros y búsqueda
  const [search, setSearch] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroCotizacion, setFiltroCotizacion] = useState('');
  const [filtroEquipo, setFiltroEquipo] = useState('');
  const [filtroFrecuencia, setFiltroFrecuencia] = useState('');
  const [filtroDia, setFiltroDia] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [agendando, setAgendando] = useState<{[id:number]: boolean}>({});
  const [msgAgendamiento, setMsgAgendamiento] = useState<{[id:number]: string}>({});
  const [eliminando, setEliminando] = useState<{[id:number]: boolean}>({});
  const [msgEliminar, setMsgEliminar] = useState<{[id:number]: string}>({});

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const contratoService = new ContratoService();
      const clientService = new ClientService();
      const equipoService = new EquipoService();
      const cotizacionService = new CotizacionService();
      const [contratosList, clientesList, equiposList, cotizacionesList] = await Promise.all([
        contratoService.getAll(),
        clientService.getAll(),
        equipoService.getAll(),
        cotizacionService.getAll(),
      ]);
      setContratos(contratosList);
      setClientes(Object.fromEntries(clientesList.map((c: any) => [c.id, c])));
      setEquipos(Object.fromEntries(equiposList.map((e: any) => [e.id, e])));
      setCotizaciones(Object.fromEntries(cotizacionesList.map((c: any) => [c.id, c])));
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return <div className="p-8 text-center">Cargando contratos...</div>;

  // Obtener valores únicos para los selects
  const frecuencias = Array.from(new Set(contratos.map(c => c.frecuencia).filter(Boolean)));
  const dias = Array.from(new Set(contratos.map(c => c.dia_visita).filter(Boolean)));
  const estados = Array.from(new Set(contratos.map(c => c.estado).filter(Boolean)));

  // Filtrado en memoria
  const contratosFiltrados = contratos.filter(contrato => {
    const clienteNombre = clientes[contrato.cliente_id]?.nombre?.toLowerCase() || '';
    const cotizacionNombre = cotizaciones[contrato.cotizacion_id]?.nombre?.toLowerCase() || '';
    const equipoNombre = equipos[contrato.equipo_id]?.nombre?.toLowerCase() || '';
    const searchLower = search.toLowerCase();
    return (
      (!search || clienteNombre.includes(searchLower) || cotizacionNombre.includes(searchLower) || contrato.id.toString().includes(searchLower)) &&
      (!filtroCliente || contrato.cliente_id.toString() === filtroCliente) &&
      (!filtroCotizacion || contrato.cotizacion_id.toString() === filtroCotizacion) &&
      (!filtroEquipo || contrato.equipo_id.toString() === filtroEquipo) &&
      (!filtroFrecuencia || contrato.frecuencia === filtroFrecuencia) &&
      (!filtroDia || contrato.dia_visita === filtroDia) &&
      (!filtroEstado || contrato.estado === filtroEstado)
    );
  });

  return (
    <div className="bg-white p-6 rounded shadow mt-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Contratos</h1>
          <p className="text-gray-600">Visualiza y administra los contratos registrados en el sistema.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            className="border rounded px-2 py-1 text-sm"
            placeholder="Buscar por cliente, cotización o ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ minWidth: 180 }}
          />
          <select className="border rounded px-2 py-1 text-sm" value={filtroEquipo} onChange={e => setFiltroEquipo(e.target.value)} style={{ minWidth: 140 }}>
            <option value="">Todos los equipos</option>
            {Object.values(equipos).map(e => (
              <option key={e.id} value={e.id}>{e.nombre || e.id}</option>
            ))}
          </select>
          <select className="border rounded px-2 py-1 text-sm" value={filtroFrecuencia} onChange={e => setFiltroFrecuencia(e.target.value)} style={{ minWidth: 120 }}>
            <option value="">Todas las frecuencias</option>
            {frecuencias.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <select className="border rounded px-2 py-1 text-sm" value={filtroDia} onChange={e => setFiltroDia(e.target.value)} style={{ minWidth: 100 }}>
            <option value="">Todos los días</option>
            {dias.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select className="border rounded px-2 py-1 text-sm" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} style={{ minWidth: 120 }}>
            <option value="">Todos los estados</option>
            {estados.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
      </div>
      <table className="min-w-full table-auto border">
        <thead>
          <tr className="bg-green-50">
            <th className="px-2 py-1 border w-12">ID</th>
            <th className="px-2 py-1 border min-w-[120px]">Cliente</th>
            <th className="px-2 py-1 border min-w-[100px]">Equipo</th>
            <th className="px-2 py-1 border min-w-[100px]">Cotización</th>
            <th className="px-2 py-1 border w-24">Inicio</th>
            <th className="px-2 py-1 border w-24">Fin</th>
            <th className="px-2 py-1 border w-20">Frecuencia</th>
            <th className="px-2 py-1 border w-20">Día</th>
            <th className="px-2 py-1 border w-20">Estado</th>
            <th className="px-2 py-1 border min-w-[170px]">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {contratosFiltrados.length === 0 ? (
            <tr><td colSpan={10} className="text-center py-4">No hay contratos registrados.</td></tr>
          ) : (
            contratosFiltrados.map(contrato => (
              <tr key={contrato.id} className="border-b hover:bg-green-50">
                <td className="px-4 py-2 border text-center">{contrato.id}</td>
                <td className="px-4 py-2 border">{clientes[contrato.cliente_id]?.nombre || contrato.cliente_id}</td>
                <td className="px-4 py-2 border">{equipos[contrato.equipo_id]?.nombre || contrato.equipo_id}</td>
                <td className="px-4 py-2 border">{cotizaciones[contrato.cotizacion_id]?.nombre || contrato.cotizacion_id}</td>
                <td className="px-4 py-2 border text-center">{contrato.fecha_inicio}</td>
                <td className="px-4 py-2 border text-center">{contrato.fecha_fin}</td>
                <td className="px-4 py-2 border text-center">{contrato.frecuencia}</td>
                <td className="px-4 py-2 border text-center">{contrato.dia_visita}</td>
                <td className="px-4 py-2 border text-center">{contrato.estado}</td>
                <td className="px-2 py-1 border text-center min-w-[170px]">
                  <div className="flex flex-row gap-1 justify-center items-center flex-wrap">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                      onClick={() => navigate(`/contratos/editar/${contrato.id}`)}
                    >
                      Editar
                    </button>
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                      disabled={!!agendando[contrato.id]}
                      onClick={async () => {
                        setAgendando(a => ({...a, [contrato.id]: true}));
                        setMsgAgendamiento(m => ({...m, [contrato.id]: ''}));
                        try {
                          const res = await VisitaService.ejecutarAgendamiento(contrato.id);
                          const mensaje = res?.mensaje || 'Agendamiento ejecutado';
                          const visitas = res?.visitas_creadas ?? 0;
                          setMsgAgendamiento(m => ({...m, [contrato.id]: `✔ ${mensaje} (${visitas} visitas)`}));
                        } catch(e:any) {
                          setMsgAgendamiento(m => ({...m, [contrato.id]: '✖ Error'}));
                        } finally {
                          setAgendando(a => ({...a, [contrato.id]: false}));
                        }
                      }}
                    >
                      {agendando[contrato.id] ? 'Agendando...' : 'Agendar visitas'}
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                      disabled={!!eliminando[contrato.id]}
                      onClick={async () => {
                        if (!window.confirm('¿Seguro que deseas eliminar este contrato?')) return;
                        setEliminando(e => ({...e, [contrato.id]: true}));
                        setMsgEliminar(m => ({...m, [contrato.id]: ''}));
                        try {
                          await new ContratoService().remove(contrato.id);
                          setMsgEliminar(m => ({...m, [contrato.id]: '✔ Contrato eliminado'}));
                          setContratos(prev => prev.filter(c => c.id !== contrato.id));
                        } catch(e:any) {
                          setMsgEliminar(m => ({...m, [contrato.id]: '✖ Error al eliminar'}));
                        } finally {
                          setEliminando(e => ({...e, [contrato.id]: false}));
                        }
                      }}
                    >
                      {eliminando[contrato.id] ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                  {msgAgendamiento[contrato.id] && (
                    <div className={`text-xs mt-1 ${msgAgendamiento[contrato.id].startsWith('✔') ? 'text-green-700' : 'text-red-600'}`}>{msgAgendamiento[contrato.id]}</div>
                  )}
                  {msgEliminar[contrato.id] && (
                    <div className={`text-xs mt-1 ${msgEliminar[contrato.id].startsWith('✔') ? 'text-green-700' : 'text-red-600'}`}>{msgEliminar[contrato.id]}</div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ContratosList;
