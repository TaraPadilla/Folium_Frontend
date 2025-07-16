import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Tipos para los props
interface Cliente {
  nombre: string;
  direccion: string;
  nombre_contacto: string;
  celular_contacto: string;
  correo_contacto: string;
}

interface TareaSeleccionada {
  id: number;
  tarea_id: number;
  incluida: boolean | number;
  visible_para_encargado: boolean | number;
}

interface PlanSeleccionado {
  id: number;
  nombre_personalizado: string;
  plan: {
    nombre: string;
    descripcion?: string;
  };
  tareas_seleccionadas: TareaSeleccionada[];
}

interface CotizacionPdfProps {
  cliente: Cliente;
  planes_seleccionados: PlanSeleccionado[];
}

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11 },
  seccion: { marginBottom: 16 },
  titulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  subtitulo: { fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  tabla: { display: 'flex', width: 'auto', marginVertical: 6 },
  fila: { flexDirection: 'row' },
  celda: { flex: 1, padding: 4, border: '1px solid #ddd' },
  celdaHeader: { backgroundColor: '#eee', fontWeight: 'bold' },
  tareaIncluida: { color: '#1a7f37', fontWeight: 'bold' },
  tareaNoIncluida: { color: '#b91c1c', fontWeight: 'bold' },
});

export const CotizacionPdf: React.FC<CotizacionPdfProps & { id?: number; fecha_creacion?: string }> = ({ cliente, planes_seleccionados, id, fecha_creacion }) => {
  // Reunir todas las tareas incluidas y no incluidas (sin repetir)
  const tareasIncluidas: { id: number; nombre: string }[] = [];
  const tareasNoIncluidas: { id: number; nombre: string }[] = [];
  // Para evitar duplicados
  const idsIncluidas = new Set<number>();
  const idsNoIncluidas = new Set<number>();

  planes_seleccionados.forEach(plan => {
    if (Array.isArray(plan.tareas_seleccionadas)) {
      plan.tareas_seleccionadas.forEach(tarea => {
        // Simulamos que el nombre de la tarea viene en tarea.nombre o tarea.tarea_nombre
        const nombre = (tarea as any).tarea?.nombre || (tarea as any).nombre || (tarea as any).tarea_nombre || `Tarea #${tarea.tarea_id}`;
        if (tarea.incluida) {
          if (!idsIncluidas.has(tarea.tarea_id)) {
            tareasIncluidas.push({ id: tarea.tarea_id, nombre });
            idsIncluidas.add(tarea.tarea_id);
          }
        } else {
          if (!idsNoIncluidas.has(tarea.tarea_id)) {
            tareasNoIncluidas.push({ id: tarea.tarea_id, nombre });
            idsNoIncluidas.add(tarea.tarea_id);
          }
        }
      });
    }
  });

  // Quitar duplicados entre incluidas y no incluidas
  const tareasNoIncluidasFiltradas = tareasNoIncluidas.filter(t => !idsIncluidas.has(t.id));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.seccion}>
          <Text style={styles.titulo}>COTIZACIÓN DE SERVICIOS #{id ?? ''}</Text>
          <Text>Fecha: {fecha_creacion ? new Date(fecha_creacion).toLocaleDateString() : new Date().toLocaleDateString()}</Text>
        </View>
        {/* Datos del cliente */}
        <View style={styles.seccion}>
          <Text>Cliente: {cliente.nombre}</Text>
          <Text>Dirección: {cliente.direccion}</Text>
        </View>
        {/* Texto de introducción */}
        <View style={styles.seccion}>
          <Text>Tenemos el agrado de presentar la siguiente cotización, la cual incluye los puntos que se detallan a continuación:</Text>
        </View>
        {/* Lista de tareas incluidas */}
        {tareasIncluidas.length > 0 && (
          <View style={styles.seccion}>
            {tareasIncluidas.map((t) => (
              <Text key={t.id}>{t.nombre}</Text>
            ))}
          </View>
        )}
        {/* Texto de exclusiones */}
        {tareasNoIncluidasFiltradas.length > 0 && (
          <View style={styles.seccion}>
            <Text>Los siguientes puntos no están incluidos en la presente cotización y, en caso de requerirse, deberán ser coordinados y presupuestados por separado:</Text>
            {tareasNoIncluidasFiltradas.map((t) => (
              <Text key={t.id}>{t.nombre}</Text>
            ))}
          </View>
        )}
        {/* Texto final */}
        <View style={styles.seccion}>
          <Text>
            Todo el personal asignado pertenece a nuestra empresa, se encuentra debidamente uniformado, con aportes al día y equipado con los elementos de protección personal (EPP) correspondientes, según las normativas vigentes.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default CotizacionPdf;
