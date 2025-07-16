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
    const cotizacionCreada = await this.cotizacionService.create(cotizacion);
    const cotizacionId = cotizacionCreada.id;

    // 2. Crear cada plan_seleccionado asociado a la cotización
    for (const { plan, tareas } of planesAgregados) {
      const planSeleccionado = await this.planSeleccionadoService.create({
        cotizacion_id: cotizacionId,
        plan_id: plan.id,
      });
      const planSeleccionadoId = planSeleccionado.id;
      // 3. Crear cada tarea_seleccionada asociada al plan_seleccionado
      for (const tarea of tareas) {
        await this.planTareaSeleccionadaService.create({
          plan_seleccionado_id: planSeleccionadoId,
          tarea_id: tarea.id,
          incluida: tarea.incluida,
          visible_para_encargado: tarea.visible_para_encargado,
        });
      }
    }
    return cotizacionId;
  }
}
