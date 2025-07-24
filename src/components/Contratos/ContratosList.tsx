import React, { useEffect, useState } from 'react';
import { Contrato, ContratoService } from '@/services/api/ContratoService';
import { CotizacionService } from '@/services/api/CotizacionService';
import { EquipoService } from '@/services/api/EquipoService';
import { Client, ClientService } from '@/services/api/ClientService';


const ContratosList: React.FC = () => {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [clientes, setClientes] = useState<Record<number, Client>>({});
  const [equipos, setEquipos] = useState<Record<number, any>>({});
  const [cotizaciones, setCotizaciones] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="container mx-auto max-w-6xl bg-white p-6 rounded shadow mt-4">
      <h1 className="text-2xl font-bold mb-4">Contratos</h1>
      <table className="min-w-full table-auto border text-xs">
        <thead>
          <tr className="bg-green-50">
            <th className="px-2 py-1 border">ID</th>
            <th className="px-2 py-1 border">Cliente</th>
            <th className="px-2 py-1 border">Equipo</th>
            <th className="px-2 py-1 border">Cotización</th>
            <th className="px-2 py-1 border">Fecha Inicio</th>
            <th className="px-2 py-1 border">Fecha Fin</th>
            <th className="px-2 py-1 border">Frecuencia</th>
            <th className="px-2 py-1 border">Día Visita</th>
            <th className="px-2 py-1 border">Estado</th>
            <th className="px-2 py-1 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {contratos.length === 0 ? (
            <tr><td colSpan={10} className="text-center py-4">No hay contratos registrados.</td></tr>
          ) : (
            contratos.map(contrato => (
              <tr key={contrato.id} className="border-b">
                <td className="px-2 py-1 border text-center">{contrato.id}</td>
                <td className="px-2 py-1 border">{clientes[contrato.cliente_id]?.nombre || contrato.cliente_id}</td>
                <td className="px-2 py-1 border">{equipos[contrato.equipo_id]?.nombre || contrato.equipo_id}</td>
                <td className="px-2 py-1 border">{cotizaciones[contrato.cotizacion_id]?.nombre || contrato.cotizacion_id}</td>
                <td className="px-2 py-1 border text-center">{contrato.fecha_inicio}</td>
                <td className="px-2 py-1 border text-center">{contrato.fecha_fin}</td>
                <td className="px-2 py-1 border text-center">{contrato.frecuencia}</td>
                <td className="px-2 py-1 border text-center">{contrato.dia_visita}</td>
                <td className="px-2 py-1 border text-center">{contrato.estado}</td>
                <td className="px-2 py-1 border text-center">
                  {/* Acciones futuras */}
                  <button className="bg-gray-300 px-2 py-1 rounded text-xs" disabled>...</button>
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
