import React, { useEffect, useState } from 'react';
import { Cotizacion, CotizacionService } from '@/services/api/CotizacionService';
import { PDFDownloadLink } from '@react-pdf/renderer';
import CotizacionPdf from '../Pdf/CotizacionPdf';

interface CotizacionRowProps {
  cotizacion: Cotizacion;
}

const CotizacionRow: React.FC<CotizacionRowProps> = ({ cotizacion }) => {
  const [pdfData, setPdfData] = React.useState<any | null>(null);
  const [loadingPdf, setLoadingPdf] = React.useState(false);
  const [showLink, setShowLink] = React.useState(false);

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

  return (
    <tr className="hover:bg-green-50">
      <td className="px-4 py-2 border">{cotizacion.id}</td>
      <td className="px-4 py-2 border">{cotizacion.cliente_id}</td>
      <td className="px-4 py-2 border">{cotizacion.fecha_creacion}</td>
      <td className="px-4 py-2 border">{cotizacion.estado}</td>
      <td className="px-4 py-2 border">{cotizacion.fecha_envio}</td>
      <td className="px-4 py-2 border">{cotizacion.fecha_aceptacion}</td>
      <td className="px-4 py-2 border">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded"
          onClick={handlePdfClick}
          disabled={loadingPdf}
        >
          {loadingPdf ? 'Generando...' : 'PDF'}
        </button>
        {showLink && pdfData && (
          <PDFDownloadLink
            document={<CotizacionPdf cliente={pdfData.cliente} planes_seleccionados={pdfData.planes_seleccionados} />}
            fileName={`cotizacion_${cotizacion.id}.pdf`}
          >
            {({ loading }) => loading ? 'Preparando...' : 'Descargar PDF'}
          </PDFDownloadLink>
        )}
      </td>
    </tr>
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
            <CotizacionRow key={c.id} cotizacion={c} />
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
