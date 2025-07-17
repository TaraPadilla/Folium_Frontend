import React, { useEffect, useState } from "react";
import { PlanMantenimientoService, PlanMantenimiento } from "@/services/api/PlanMantenimientoService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusIcon, EditIcon, TrashIcon } from "lucide-react";

const planService = new PlanMantenimientoService();

const defaultForm = {
  id: null,
  nombre: "",
  descripcion: "",
};

const PlanesTab: React.FC = () => {
  const [planes, setPlanes] = useState<PlanMantenimiento[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ ...defaultForm });
  const [loading, setLoading] = useState(false);

  const fetchPlanes = async () => {
    try {
      const data = await planService.getAll();
      setPlanes(Array.isArray(data) ? data : []);
    } catch (error) {
      setPlanes([]);
    }
  };

  useEffect(() => {
    fetchPlanes();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (form.id) {
        await planService.update(form.id, { nombre: form.nombre, descripcion: form.descripcion });
      } else {
        await planService.create({ nombre: form.nombre, descripcion: form.descripcion });
      }
      await fetchPlanes();
      setForm({ ...defaultForm });
      setModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: PlanMantenimiento) => {
    setForm({
      id: plan.id,
      nombre: plan.nombre,
      descripcion: plan.descripcion,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este plan?")) return;
    setLoading(true);
    try {
      await planService.remove(id);
      await fetchPlanes();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tipo de Servicio</CardTitle>
        <Button
          onClick={() => {
            setForm({ ...defaultForm });
            setModalOpen(true);
          }}
        >
          <PlusIcon className="h-4 w-4 mr-2" /> Nuevo plan
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {planes.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>{plan.nombre}</TableCell>
                <TableCell>{plan.descripcion}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(plan.id)}>
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
            <DialogTitle>{form.id ? "Editar plan" : "Nuevo plan de mantenimiento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input
              name="nombre"
              placeholder="Nombre del plan"
              value={form.nombre}
              onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
              required
            />
            <Input
              name="descripcion"
              placeholder="Descripción"
              value={form.descripcion}
              onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
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

export default PlanesTab;
