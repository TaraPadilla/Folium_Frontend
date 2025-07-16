import React, { useEffect, useState } from 'react';
import { Cotizacion, CotizacionService } from '@/services/api/CotizacionService';

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

  if (loading) return <div>Cargando cotizaciones...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Cotizaciones</h2>
        <NuevaCotizacionButton />
      </div>
      <table className="min-w-full table-auto border">
        <thead>
          <tr className="bg-green-100">
            <th className="px-4 py-2 border">ID</th>
            <th className="px-4 py-2 border">Cliente ID</th>
            <th className="px-4 py-2 border">Fecha Creación</th>
            <th className="px-4 py-2 border">Estado</th>
            <th className="px-4 py-2 border">Fecha Envío</th>
            <th className="px-4 py-2 border">Fecha Aceptación</th>
          </tr>
        </thead>
        <tbody>
          {cotizaciones.map(c => (
            <tr key={c.id} className="hover:bg-green-50">
              <td className="px-4 py-2 border">{c.id}</td>
              <td className="px-4 py-2 border">{c.cliente_id}</td>
              <td className="px-4 py-2 border">{c.fecha_creacion}</td>
              <td className="px-4 py-2 border">{c.estado}</td>
              <td className="px-4 py-2 border">{c.fecha_envio}</td>
              <td className="px-4 py-2 border">{c.fecha_aceptacion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

import { useNavigate } from 'react-router-dom';

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
