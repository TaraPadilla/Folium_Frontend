import React, { useEffect, useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusIcon, EditIcon, TrashIcon } from "lucide-react";
import { UsuarioService, Usuario } from "@/services/api/UsuarioService";
import { roles} from "@/types/index";

const usuarioService = new UsuarioService();

const defaultForm = {
  id: null,
  nombre: "",
  correo: "",
  contrasena: "",
  rol: "",
};

const UsersTab: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ ...defaultForm });
  const [loading, setLoading] = useState(false);

  const fetchUsuarios = async () => {
    try {
      const data = await usuarioService.getAll();
      setUsuarios(data);
    } catch {
      setUsuarios([]);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (form.id) {
        const { contrasena, ...rest } = form;
        const payload = contrasena ? form : rest;
        await usuarioService.update(form.id, payload);
      } else {
        await usuarioService.create(form as any);
      }
      await fetchUsuarios();
      setForm({ ...defaultForm });
      setModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setForm({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      contrasena: "",
      rol: usuario.rol,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    setLoading(true);
    try {
      await usuarioService.remove(id);
      await fetchUsuarios();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Usuarios</CardTitle>
        <Button
          onClick={() => {
            setForm({ ...defaultForm });
            setModalOpen(true);
          }}
        >
          <PlusIcon className="h-4 w-4 mr-2" /> Crear usuario
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.nombre}</TableCell>
                <TableCell>{u.correo}</TableCell>
                <TableCell>{u.rol}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(u)}>
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(u.id)}>
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
            <DialogTitle>{form.id ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
            />
            <Input
              name="correo"
              placeholder="Correo"
              value={form.correo}
              onChange={(e) => setForm((prev) => ({ ...prev, correo: e.target.value }))}
              type="email"
            />
            <Input
              name="contrasena"
              placeholder="Contraseña"
              value={form.contrasena}
              onChange={(e) => setForm((prev) => ({ ...prev, contrasena: e.target.value }))}
              type="password"
              required={!form.id}
            />
            <select
              name="rol"
              value={form.rol}
              onChange={(e) => setForm((prev) => ({ ...prev, rol: e.target.value }))}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Selecciona un rol</option>
              {roles.map((role) => (
                <option key={role} value={role}>{role}</option>
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

export default UsersTab;
