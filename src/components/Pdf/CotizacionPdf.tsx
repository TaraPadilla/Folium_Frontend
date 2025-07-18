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
  observaciones?: string;
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

// Placeholder logo
const firmaURL = `${import.meta.env.VITE_IMAGE_URL}/firma.png`;

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
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
  planTitulo: {
    backgroundColor: '#d1fae5', // verde suave
    color: '#065f46',           // verde oscuro
    padding: 4,
    fontWeight: 'bold',
    fontSize: 11,
    marginTop: 10,
  },
  tareaItem: {
    marginLeft: 10,
    fontSize: 11,
    marginBottom: 2,
  },
  observacion: {
    marginLeft: 14,
    fontSize: 10,
    fontStyle: 'italic',
    color: '#4b5563',
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
});

export const CotizacionPdf: React.FC<Props> = ({
  cliente,
  planes_seleccionados,
  consideraciones,
  propuesta_economica,
  id,
  fecha_creacion,
}) => {
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
        {planes_seleccionados.map((plan, i) => {
          const incluidas = plan.tareas_seleccionadas.filter(t => t.incluida);
          if (incluidas.length === 0) return null;

          return (
            <View key={`incluidas-${i}`} wrap={false}>
              <Text style={styles.planTitulo}>{plan.plan.nombre}</Text>
              {incluidas.map((t, j) => {
                const nombre = t.tarea?.nombre || t.nombre || t.tarea_nombre || `Tarea #${t.tarea_id}`;
                return (
                  <View key={j}>
                    <Text style={styles.tareaItem}>{nombre}</Text>
                    {t.observaciones?.trim() && (
                      <Text style={styles.observacion}>Obs: {t.observaciones}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* Exclusiones */}
        {planes_seleccionados.some(plan => plan.tareas_seleccionadas.some(t => !t.incluida)) && (
          <>
            <Text style={{ marginTop: 12, marginBottom: 10 }}>
              Los siguientes puntos no están incluidos en la presente cotización y, en caso de requerirse, deberán ser coordinados y presupuestados por separado:
            </Text>
            {planes_seleccionados.map((plan, i) => {
              const excluidas = plan.tareas_seleccionadas.filter(t => !t.incluida);
              if (excluidas.length === 0) return null;

              return (
                <View key={`excluidas-${i}`} wrap={false}>
                  <Text style={styles.planTitulo}>{plan.plan.nombre}</Text>
                  {excluidas.map((t, j) => {
                    const nombre = t.tarea?.nombre || t.nombre || t.tarea_nombre || `Tarea #${t.tarea_id}`;
                    return (
                      <View key={j}>
                        <Text style={styles.tareaItem}>{nombre}</Text>
                        {t.observaciones?.trim() && (
                          <Text style={styles.observacion}>Obs: {t.observaciones}</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </>
        )}

        {/* Aviso EPP */}
        <Text style={{ marginTop: 12 }}>
          Todo el personal asignado pertenece a nuestra empresa, se encuentra debidamente uniformado, con aportes al día y equipado con los elementos de protección personal (EPP) correspondientes, según las normativas vigentes.
        </Text>

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
            <Text style={{ fontWeight: 'bold' }}>{propuesta_economica}</Text>
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
