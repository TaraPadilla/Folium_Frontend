import React, { useEffect, useState } from "react";
import { PlanMantenimientoService, PlanMantenimiento } from "@/services/api/PlanMantenimientoService";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";

const planService = new PlanMantenimientoService();

const PlanesTab: React.FC = () => {
  const [planes, setPlanes] = useState<PlanMantenimiento[]>([]);
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPlanes = async () => {
    try {
      const data = await planService.getAll();
      setPlanes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar planes:", error);
    }
  };

  useEffect(() => {
    fetchPlanes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await planService.create({ nombre, descripcion });
      setNombre("");
      setDescripcion("");
      setOpen(false);
      fetchPlanes();
    } catch (error) {
      console.error("Error al crear plan:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Planes de Mantenimiento</h2>
          <Button onClick={() => setOpen(true)} variant="default" size="sm">
            <PlusIcon className="w-4 h-4 mr-1" /> Nuevo Plan
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {planes.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>{plan.nombre}</TableCell>
                <TableCell>{plan.descripcion}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Plan de Mantenimiento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <Input value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Nombre del plan" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <Input value={descripcion} onChange={e => setDescripcion(e.target.value)} required placeholder="Descripción" />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancelar</Button>
              <Button type="submit" disabled={loading}>{loading ? "Creando..." : "Crear"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PlanesTab;
