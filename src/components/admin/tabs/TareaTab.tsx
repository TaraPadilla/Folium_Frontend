import React, { useEffect, useState } from "react";
import { TareaService, Tarea } from "@/services/api/TareaService";
import { PlanMantenimientoService, PlanMantenimiento } from "@/services/api/PlanMantenimientoService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusIcon, EditIcon, TrashIcon } from "lucide-react";

const tareaService = new TareaService();
const planService = new PlanMantenimientoService();

const defaultForm = {
  id: null,
  nombre: "",
  plan_id: "",
  tipo: "predefinida",
};

const TareaTab: React.FC = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [planes, setPlanes] = useState<PlanMantenimiento[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<any>({ ...defaultForm });
  const [loading, setLoading] = useState(false);

  const fetchTareas = async () => {
    try {
      const data = await tareaService.getAll();
      setTareas(Array.isArray(data) ? data : []);
    } catch {
      setTareas([]);
    }
  };

  const fetchPlanes = async () => {
    try {
      const data = await planService.getAll();
      setPlanes(Array.isArray(data) ? data : []);
    } catch {
      setPlanes([]);
    }
  };

  useEffect(() => {
    fetchTareas();
    fetchPlanes();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (form.id) {
        await tareaService.update(form.id, {
          nombre: form.nombre,
          plan_id: Number(form.plan_id),
          tipo: form.tipo,
        });
      } else {
        await tareaService.create({
          nombre: form.nombre,
          plan_id: Number(form.plan_id),
          tipo: form.tipo,
        });
      }
      await fetchTareas();
      setForm({ ...defaultForm });
      setModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tarea: Tarea) => {
    setForm({
      id: tarea.id,
      nombre: tarea.nombre,
      plan_id: tarea.plan_id,
      tipo: tarea.tipo,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar esta tarea?")) return;
    setLoading(true);
    try {
      await tareaService.remove(id);
      await fetchTareas();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tareas</CardTitle>
        <Button
          onClick={() => {
            setForm({ ...defaultForm });
            setModalOpen(true);
          }}
        >
          <PlusIcon className="h-4 w-4 mr-2" /> Nueva tarea
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tareas.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.nombre}</TableCell>
                <TableCell>{planes.find((p) => p.id === t.plan_id)?.nombre || t.plan_id}</TableCell>
                <TableCell>{t.tipo}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(t)}>
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(t.id)}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar tarea" : "Nueva tarea"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input
              name="nombre"
              placeholder="Nombre de la tarea"
              value={form.nombre}
              onChange={(e) => setForm((prev: any) => ({ ...prev, nombre: e.target.value }))}
              required
            />
            <select
              name="plan_id"
              value={form.plan_id}
              onChange={(e) => setForm((prev: any) => ({ ...prev, plan_id: e.target.value }))}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Selecciona un plan</option>
              {planes.map((plan) => (
                <option key={plan.id} value={plan.id}>{plan.nombre}</option>
              ))}
            </select>
            <Input
              name="tipo"
              placeholder="Tipo"
              value={form.tipo}
              onChange={(e) => setForm((prev: any) => ({ ...prev, tipo: e.target.value }))}
              required
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Guardando..." : (form.id ? "Actualizar" : "Guardar")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TareaTab;
