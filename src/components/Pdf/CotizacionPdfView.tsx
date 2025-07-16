import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PDFViewer } from '@react-pdf/renderer';
import CotizacionPdf from './CotizacionPdf';

const CotizacionPdfView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    import('@/services/api/CotizacionService').then(mod => {
      const service = new mod.CotizacionService();
      service.getById(Number(id))
        .then(setData)
        .catch(() => setError('No se pudo cargar la cotización.'))
        .finally(() => setLoading(false));
    });
  }, [id]);

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100">
      <div className="p-4 bg-white shadow flex items-center">
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow mr-4"
          onClick={() => navigate('/cotizaciones')}
        >
          ← Volver al listado
        </button>
        <span className="text-lg font-bold">Vista previa PDF Cotización #{id}</span>
      </div>
      <div className="flex-1 flex justify-center items-center bg-gray-100">
        {loading && <div>Cargando PDF...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {data && (
          <PDFViewer width="90%" height="90%">
            <CotizacionPdf {...data} fecha_creacion={data.created_at} />
          </PDFViewer>
        )}
      </div>
    </div>
  );
};

export default CotizacionPdfView;
