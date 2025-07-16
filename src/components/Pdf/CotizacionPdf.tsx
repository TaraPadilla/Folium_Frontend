import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import Header from './Header';
import Footer from './Footer';

// Tipos
interface Cliente {
  nombre: string;
  direccion: string;
}

interface TareaSeleccionada {
  id: number;
  tarea_id: number;
  incluida: boolean | number;
  tarea?: { nombre?: string };
  nombre?: string;
  tarea_nombre?: string;
}

interface PlanSeleccionado {
  id: number;
  plan: { nombre: string };
  tareas_seleccionadas: TareaSeleccionada[];
}

interface Props {
  cliente: Cliente;
  planes_seleccionados: PlanSeleccionado[];
  consideraciones?: string;
  propuesta_economica?: string;
  id?: number;
  fecha_creacion?: string;
}

// Placeholder logo (reemplazable)
const firmaURL = `${import.meta.env.VITE_IMAGE_URL}/firma.png`;

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  header: {
    width: '100%',
    height: 100,
  },
  logo: {
    width: 120,
    height: 120,
    marginLeft: 350,
  },
  fieldBlock: { marginBottom: 8 },
  tituloPrincipal: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 16,
    textDecoration: 'underline',
  },
  subtitulo: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 6,
    textDecoration: 'underline',
  },
  tarea: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  firma: {
    width: 100,
    height: 40,
    marginBottom: 4,
  },
  bloqueFirma: {
    marginTop: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  arriba: {
    width: 595.28, // ancho exacto de A4
    height: 100,
    marginTop: -25,
    marginLeft: -25,
  },  
});

export const CotizacionPdf: React.FC<Props> = ({
  cliente,
  planes_seleccionados,
  consideraciones,
  propuesta_economica,
  id,
  fecha_creacion,
}) => {
  const tareasIncluidas: string[] = [];
  const tareasExcluidas: string[] = [];
  const idsIncluidas = new Set<number>();

  planes_seleccionados.forEach((plan) => {
    plan.tareas_seleccionadas.forEach((t) => {
      const nombre = t.tarea?.nombre || t.nombre || t.tarea_nombre || `Tarea #${t.tarea_id}`;
      if (t.incluida) {
        if (!idsIncluidas.has(t.tarea_id)) {
          tareasIncluidas.push(nombre);
          idsIncluidas.add(t.tarea_id);
        }
      } else {
        if (!idsIncluidas.has(t.tarea_id)) {
          tareasExcluidas.push(nombre);
        }
      }
    });
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header />

        {/* Datos */}
        <View style={styles.fieldBlock}>
          <Text>Presupuesto Nº {id ?? ''}</Text>
          <Text>Fecha: {fecha_creacion ? new Date(fecha_creacion).toLocaleDateString() : new Date().toLocaleDateString()}</Text>
          <Text>Cliente: {cliente.nombre}</Text>
          <Text>Dirección: {cliente.direccion}</Text>
        </View>

        {/* Título */}
        <Text style={styles.tituloPrincipal}>PRESUPUESTO</Text>

        {/* Subtítulo */}
        <Text style={styles.subtitulo}>PROPUESTA TÉCNICA</Text>
        <Text style={{ marginBottom: 10 }}>
          Tenemos el agrado de presentar la siguiente cotización, la cual incluye los puntos que se detallan a continuación:
        </Text>

        {/* Tareas incluidas */}
        {tareasIncluidas.map((nombre, i) => (
          <Text key={i} style={styles.tarea}>{nombre}</Text>
        ))}

        {/* Exclusiones */}
        {tareasExcluidas.length > 0 && (
          <>
            <Text style={{ marginTop: 12, marginBottom: 10 }}>
              Los siguientes puntos no están incluidos en la presente cotización y, en caso de requerirse, deberán ser coordinados y presupuestados por separado:
            </Text>
            {tareasExcluidas.map((nombre, i) => (
              <Text key={i} style={styles.tarea}>{nombre}</Text>
            ))}
          </>
        )}

        {/* Aviso EPP */}
        <Text style={{ marginTop: 12 }}>
          Todo el personal asignado pertenece a nuestra empresa, se encuentra debidamente uniformado, con aportes al día y equipado con los elementos de protección personal (EPP) correspondientes, según las normativas vigentes.
        </Text>
        <Footer />
      </Page>
      <Page size="A4" style={styles.page}>
        <Header />
        {/* Consideraciones */}
        {consideraciones?.trim() && (
          <>
            <Text style={[styles.subtitulo, { marginTop: 20 }]}>CONSIDERACIONES</Text>
            <Text>{consideraciones}</Text>
          </>
        )}

        {/* Propuesta económica */}
        {propuesta_economica?.trim() && (
          <>
            <Text style={[styles.subtitulo, { marginTop: 20 }]}>PROPUESTA ECONÓMICA</Text>
            <Text style={{fontWeight: 'bold'}}>{propuesta_economica}</Text>
          </>
        )}


        {/* Cierre */}
        <Text style={{ marginTop: 16 }}>
          Quedamos a las órdenes por cualquier duda o aclaración que necesite. Será un gusto para nosotros poder llevar adelante este trabajo.
        </Text>

        {/* Firma */}
        <View style={styles.bloqueFirma}>
          <Image src={firmaURL} style={styles.firma} />
          <Text>Marcos Lorenzo</Text>
          <Text>Ingeniero Agrónomo</Text>
          <Text>DIRECTOR</Text>
        </View>
        <Footer />
      </Page>
    </Document>
  );
};

export default CotizacionPdf;
