import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { PlusIcon, SearchIcon, EditIcon, TrashIcon } from "lucide-react";
import { CityService } from "@/services/api/CityService";

const cityService = new CityService();

const CityTab: React.FC = () => {
  const [cities, setCities] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    id: null,
    departamento: "",
    ciudad: "",
    zona: "",
  });

  const loadCities = async () => {
    try {
      const data = await cityService.getAll();
      setCities(data);
    } catch (err) {
      console.error("Error al cargar ciudades:", err);
    }
  };

  const handleSave = async () => {
    if (!form.departamento.trim() || !form.ciudad.trim() || !form.zona.trim()) {
      console.warn("Formulario inválido");
      return;
    }

    try {
      if (form.id) {
        await cityService.update(form.id, { departamento: form.departamento, ciudad: form.ciudad, zona: form.zona });
      } else {
        await cityService.create({ departamento: form.departamento, ciudad: form.ciudad, zona: form.zona });
      }

      await loadCities();
      setForm({ id: null, departamento: "", ciudad: "", zona: "" });
      setModalOpen(false);
    } catch (err: any) {
      console.error("❌ Error al guardar ciudad:", err?.response ?? err);
    }
  };

  const handleEdit = (city) => {
    setForm({ id: city.id, departamento: city.departamento, ciudad: city.ciudad, zona: city.zona });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("¿Eliminar esta ciudad?");
    if (!confirmDelete) return;

    try {
      await cityService.remove(id);
      await loadCities();
    } catch (err) {
      console.error("Error al eliminar ciudad:", err);
    }
  };

  useEffect(() => {
    loadCities();
  }, []);

  const filtered = cities.filter((c) =>
    (c.ciudad ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.departamento ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.zona ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ciudades</CardTitle>
          <Button
            onClick={() => {
              setForm({ id: null, departamento: "", ciudad: "", zona: "" });
              setModalOpen(true);
            }}
          >
            <PlusIcon className="h-4 w-4 mr-2" /> Agregar ciudad
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Zona</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((city) => (
                  <TableRow key={city.id}>
                    <TableCell>{city.departamento}</TableCell>
                    <TableCell>{city.ciudad}</TableCell>
                    <TableCell>{city.zona}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(city)}>
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(city.id)}>
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-4">
              {form.id ? "Editar Ciudad" : "Nueva Ciudad"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Departamento"
              value={form.departamento}
              onChange={(e) => setForm({ ...form, departamento: e.target.value })}
            />
            <Input
              placeholder="Ciudad"
              value={form.ciudad}
              onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
            />
            <Input
              placeholder="Zona"
              value={form.zona}
              onChange={(e) => setForm({ ...form, zona: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>
                {form.id ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CityTab;
