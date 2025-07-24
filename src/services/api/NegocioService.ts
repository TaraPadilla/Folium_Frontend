import { Cotizacion, CotizacionService } from './CotizacionService';
import { PlanSeleccionadoService } from './PlanSeleccionadoService';
import { PlanTareaSeleccionadaService } from './PlanTareaSeleccionadaService';
import { Contrato, ContratoService } from './ContratoService';
import { ClientService } from './ClientService';

export class NegocioService {
  cotizacionService = new CotizacionService();
  planSeleccionadoService = new PlanSeleccionadoService();
  planTareaSeleccionadaService = new PlanTareaSeleccionadaService();

  /**
   * Actualiza la cotización y sus planes/tareas seleccionados de forma transaccional.
   * @param cotizacion Cotización a actualizar (debe tener id)
   * @param planesAgregados Array de objetos { plan, tareas }
   * @returns El id de la cotización actualizada
   */
  async actualizarCotizacionConPlanesYtareas(
    cotizacion: { id: number; cliente_id: number; consideraciones?: string; propuesta_economica?: string },
    planesAgregados: Array<{ plan: any; tareas: any[] }>
  ): Promise<number> {
    // 1. Actualiza la cotización principal
    await this.cotizacionService.update(cotizacion.id, {
      cliente_id: cotizacion.cliente_id,
      consideraciones: cotizacion.consideraciones,
      propuesta_economica: cotizacion.propuesta_economica,
    });

    // 2. Elimina todos los planes seleccionados y tareas asociadas de esta cotización
    const planesSeleccionados = await this.planSeleccionadoService.getAll();
    const planesDeEstaCotizacion = planesSeleccionados.filter((p: any) => p.origen_tipo === 'cotizacion' && p.origen_id === cotizacion.id);
    for (const planSel of planesDeEstaCotizacion) {
      // Elimina tareas asociadas
      const tareasSel = await this.planTareaSeleccionadaService.getAll();
      const tareasDePlan = tareasSel.filter((t: any) => t.plan_seleccionado_id === planSel.id);
      for (const tarea of tareasDePlan) {
        await this.planTareaSeleccionadaService.remove(tarea.id);
      }
      // Elimina el plan seleccionado
      await this.planSeleccionadoService.remove(planSel.id);
    }

    // 3. Crea los nuevos planes seleccionados y tareas como en la creación
    for (const { plan, tareas } of planesAgregados) {
      const planSeleccionado = await this.planSeleccionadoService.create({
        origen_tipo: 'cotizacion',
        origen_id: cotizacion.id,
        plan_id: plan.id,
        nombre_personalizado: plan.nombre ?? '',
        precio_referencial: plan.precio_referencial ?? 0,
      });
      const planSeleccionadoId = planSeleccionado.id;
      for (const tarea of tareas) {
        await this.planTareaSeleccionadaService.create({
          plan_seleccionado_id: planSeleccionadoId,
          tarea_id: tarea.id,
          incluida: tarea.incluida,
          visible_para_encargado: tarea.visible_para_encargado,
          observaciones: tarea.observaciones ?? null,
        });
      }
    }
    return cotizacion.id;
  }

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
  /**
   * Guarda el contrato y sus planes/tareas seleccionados de forma transaccional.
   * @param contrato Contrato a guardar (sin id)
   * @param planesAgregados Array de objetos { plan, tareas }
   * @returns El id del contrato creado
   */
  async guardarContratoConPlanesYtareas(
    contrato: Omit<Contrato, 'id'>,
    planesAgregados: Array<{ plan: any; tareas: any[] }>
  ): Promise<number> {
    const contratoService = new ContratoService();
    const planSeleccionadoService = new PlanSeleccionadoService();
    const planTareaSeleccionadaService = new PlanTareaSeleccionadaService();
    // 1. Crear contrato y obtener id
    const creado = await contratoService.create(contrato);
    const contratoId = creado.id!;
    // 2. Crear cada plan_seleccionado asociado al contrato y sus tareas
    for (const { plan, tareas } of planesAgregados) {
      const planSeleccionado = await planSeleccionadoService.create({
        origen_tipo: 'contrato',
        origen_id: contratoId,
        plan_id: plan.id,
        nombre_personalizado: plan.nombre ?? '',
        precio_referencial: 0
      });
      const planSeleccionadoId = planSeleccionado.id;
      // 3. Crear tareas asociadas a este plan
      for (const tarea of tareas || []) {
        await planTareaSeleccionadaService.create({
          plan_seleccionado_id: planSeleccionadoId,
          tarea_id: tarea.tarea_id || tarea.id,
          visible_para_encargado: tarea.visible_para_encargado,
          observaciones: tarea.observaciones ?? null,
          incluida: tarea.incluida ?? 1
        });
      }
    }
    // 4. Actualizar estado del cliente a 'activo'
    const clientService = new ClientService();
    await clientService.update(contrato.cliente_id, { estado: 'activo' });
    // 5. Actualizar cotización relacionada a 'aceptada'
    if (contrato.cotizacion_id) {
      await this.cotizacionService.update(contrato.cotizacion_id, { estado: 'aceptada' });
    }
    return contratoId;
  }
}
