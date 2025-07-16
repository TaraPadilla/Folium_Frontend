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

export const CotizacionPdf: React.FC<CotizacionPdfProps> = ({ cliente, planes_seleccionados }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Encabezado */}
      <View style={styles.seccion}>
        <Text style={styles.titulo}>COTIZACIÓN DE SERVICIOS</Text>
        <Text>Fecha: {new Date().toLocaleDateString()}</Text>
      </View>
      {/* Datos del cliente */}
      <View style={styles.seccion}>
        <Text style={styles.subtitulo}>Datos del Cliente</Text>
        <Text>Nombre: {cliente.nombre}</Text>
        <Text>Dirección: {cliente.direccion}</Text>
        <Text>Contacto: {cliente.nombre_contacto} - {cliente.celular_contacto}</Text>
        <Text>Correo: {cliente.correo_contacto}</Text>
      </View>
      {/* Planes y tareas */}
      {planes_seleccionados.map((plan) => (
        <View key={plan.id} style={styles.seccion}>
          <Text style={styles.subtitulo}>{plan.nombre_personalizado || plan.plan.nombre}</Text>
          {plan.plan.descripcion && <Text>{plan.plan.descripcion}</Text>}
          <View style={styles.tabla}>
            <View style={[styles.fila, styles.celdaHeader]}>
              <Text style={styles.celda}>#</Text>
              <Text style={styles.celda}>Incluida</Text>
              <Text style={styles.celda}>Visible encargado</Text>
            </View>
            {plan.tareas_seleccionadas.map((tarea, idx) => (
              <View style={styles.fila} key={tarea.id}>
                <Text style={styles.celda}>{tarea.tarea_id}</Text>
                <Text style={[styles.celda, tarea.incluida ? styles.tareaIncluida : styles.tareaNoIncluida]}>
                  {tarea.incluida ? 'Sí' : 'No'}
                </Text>
                <Text style={styles.celda}>{tarea.visible_para_encargado ? 'Sí' : 'No'}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
      {/* Pie de página */}
      <View style={styles.seccion}>
        <Text>Gracias por su interés. Esta cotización es válida por 30 días.</Text>
      </View>
    </Page>
  </Document>
);

export default CotizacionPdf;
