import React, { useEffect, useState } from "react";
import { EquipoService, Equipo } from "@/services/api/EquipoService";
import { UsuarioService, Usuario } from "@/services/api/UsuarioService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusIcon, EditIcon, TrashIcon } from "lucide-react";

const equipoService = new EquipoService();
const usuarioService = new UsuarioService();

const defaultForm = {
  id: null,
  nombre: "",
  id_user_encargado: null,
};

const EquipoTab: React.FC = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ ...defaultForm });
  const [loading, setLoading] = useState(false);

  const fetchEquipos = async () => {
    try {
      const data = await equipoService.getAll();
      console.log(data);
      setEquipos(Array.isArray(data) ? data : []);
    } catch (error) {
      setEquipos([]);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const data = await usuarioService.getAll();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      setUsuarios([]);
    }
  };

  useEffect(() => {
    fetchEquipos();
    fetchUsuarios();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (form.id) {
        await equipoService.update(form.id, { nombre: form.nombre, id_user_encargado: form.id_user_encargado });
      } else {
        await equipoService.create({ nombre: form.nombre, id_user_encargado: form.id_user_encargado });
      }
      await fetchEquipos();
      setForm({ ...defaultForm });
      setModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (equipo: Equipo) => {
    setForm({
      id: equipo.id,
      nombre: equipo.nombre,
      id_user_encargado: equipo.id_user_encargado,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este equipo?")) return;
    setLoading(true);
    try {
      await equipoService.remove(id);
      await fetchEquipos();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Equipos</CardTitle>
        <Button
          onClick={() => {
            setForm({ ...defaultForm });
            setModalOpen(true);
          }}
        >
          <PlusIcon className="h-4 w-4 mr-2" /> Nuevo equipo
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Encargado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipos.map((equipo) => (
              <TableRow key={equipo.id}>
                <TableCell>{equipo.nombre}</TableCell>
                <TableCell>{equipo.user_encargado?.nombre}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(equipo)}>
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(equipo.id)}>
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
            <DialogTitle>{form.id ? "Editar Equipo" : "Nuevo Equipo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input
              name="nombre"
              placeholder="Nombre del equipo"
              value={form.nombre}
              onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
              required
            />
            <select
              className="w-full border rounded p-2"
              value={form.id_user_encargado || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, id_user_encargado: Number(e.target.value) }))}
              required
            >
              <option value="">Selecciona un encargado</option>
              {usuarios.map((user) => (
                <option key={user.id} value={user.id}>{user.nombre}</option>
              ))}
            </select>
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

export default EquipoTab;
