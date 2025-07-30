import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Contrato, ContratoService } from '@/services/api/ContratoService';
import { CotizacionService } from '@/services/api/CotizacionService';
import { EquipoService } from '@/services/api/EquipoService';
import { Client, ClientService } from '@/services/api/ClientService';


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
    <div className="container mx-auto max-w-6xl bg-white p-6 rounded shadow mt-4">
      <h1 className="text-2xl font-bold mb-2">Gestión de Contratos</h1>
      <div className="mb-4 text-gray-600">Visualiza y administra los contratos registrados en el sistema.</div>
      {/* Filtros y buscador */}
      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <div>
          <label className="block text-xs font-semibold mb-1">Buscar</label>
          <input
            type="text"
            placeholder="Cliente, Cotización o ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border px-2 py-1 rounded text-xs"
          />
        </div>
        {/* <div>
          <label className="block text-xs font-semibold mb-1">Cliente</label>
          <select className="border px-2 py-1 rounded text-xs" value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)}>
            <option value="">Todos</option>
            {Object.values(clientes).map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Cotización</label>
          <select className="border px-2 py-1 rounded text-xs" value={filtroCotizacion} onChange={e => setFiltroCotizacion(e.target.value)}>
            <option value="">Todas</option>
            {Object.values(cotizaciones).map(c => (
              <option key={c.id} value={c.id}>{c.nombre || c.id}</option>
            ))}
          </select>
        </div> */}
        <div>
          <label className="block text-xs font-semibold mb-1">Equipo</label>
          <select className="border px-2 py-1 rounded text-xs" value={filtroEquipo} onChange={e => setFiltroEquipo(e.target.value)}>
            <option value="">Todos</option>
            {Object.values(equipos).map(e => (
              <option key={e.id} value={e.id}>{e.nombre || e.id}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Frecuencia</label>
          <select className="border px-2 py-1 rounded text-xs" value={filtroFrecuencia} onChange={e => setFiltroFrecuencia(e.target.value)}>
            <option value="">Todas</option>
            {frecuencias.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Día Visita</label>
          <select className="border px-2 py-1 rounded text-xs" value={filtroDia} onChange={e => setFiltroDia(e.target.value)}>
            <option value="">Todos</option>
            {dias.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Estado</label>
          <select className="border px-2 py-1 rounded text-xs" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="">Todos</option>
            {estados.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
 
        <table className="min-w-full table-auto border text-xs rounded">
          <thead>
            <tr className="bg-green-50">
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Cliente</th>
              <th className="px-4 py-2 border">Equipo</th>
              <th className="px-4 py-2 border">Cotización</th>
              <th className="px-4 py-2 border">Fecha Inicio</th>
              <th className="px-4 py-2 border">Fecha Fin</th>
              <th className="px-4 py-2 border">Frecuencia</th>
              <th className="px-4 py-2 border">Día Visita</th>
              <th className="px-4 py-2 border">Estado</th>
              <th className="px-4 py-2 border">Acciones</th>
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
                  <td className="px-4 py-2 border text-center">
  <button
    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs mr-2"
    onClick={() => navigate(`/contratos/editar/${contrato.id}`)}
  >
    Editar
  </button>
</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContratosList;
