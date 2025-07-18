import { Cotizacion, CotizacionService } from './CotizacionService';
import { PlanSeleccionadoService } from './PlanSeleccionadoService';
import { PlanTareaSeleccionadaService } from './PlanTareaSeleccionadaService';

export class NegocioService {
  cotizacionService = new CotizacionService();
  planSeleccionadoService = new PlanSeleccionadoService();
  planTareaSeleccionadaService = new PlanTareaSeleccionadaService();

  /**
   * Guarda la cotización y sus planes/tareas seleccionados de forma transaccional.
   * @param cotizacion Cotización a guardar (sin id)
   * @param planesAgregados Array de objetos { plan, tareas }
   * @returns El id de la cotización creada
   */
  async guardarCotizacionConPlanesYtareas(
    cotizacion: Omit<Cotizacion, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
    planesAgregados: Array<{ plan: any; tareas: any[] }>
  ): Promise<number> {
    // 1. Crear cotización y obtener id
    console.log('Cotizacion a guardar:', cotizacion);
    console.log('Planes y tareas a guardar:', planesAgregados);
    
    const cotizacionCreada = await this.cotizacionService.create(cotizacion);
    const cotizacionId = cotizacionCreada.id;

    // 2. Crear cada plan_seleccionado asociado a la cotización
    for (const { plan, tareas } of planesAgregados) {
      console.log('Plan a guardar:', plan);
      const planSeleccionado = await this.planSeleccionadoService.create({
        origen_tipo: 'cotizacion',
        origen_id: cotizacionId,
        plan_id: plan.id,
        nombre_personalizado: plan.nombre ?? '',
        precio_referencial: plan.precio_referencial ?? 0,
      });
      const planSeleccionadoId = planSeleccionado.id;
      console.log('Plan seleccionado creado:', planSeleccionado);
      // 3. Crear cada tarea_seleccionada asociada al plan_seleccionado
      for (const tarea of tareas) {
        console.log('Tarea a guardar:', tarea);
        await this.planTareaSeleccionadaService.create({
          plan_seleccionado_id: planSeleccionadoId,
          tarea_id: tarea.id,
          incluida: tarea.incluida,
          visible_para_encargado: tarea.visible_para_encargado,
          observaciones: tarea.observaciones ?? null,
        });
      }
    }
    return cotizacionId;
  }
}
