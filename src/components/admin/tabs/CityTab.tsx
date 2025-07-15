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
    ciudad: "",
    provincia: "",
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
    if (!form.ciudad.trim() || !form.provincia.trim()) {
      console.warn("Formulario inválido");
      return;
    }

    try {
      if (form.id) {
        await cityService.update(form.id, { ciudad: form.ciudad, provincia: form.provincia });
      } else {
        await cityService.create({ ciudad: form.ciudad, provincia: form.provincia });
      }

      await loadCities();
      setForm({ id: null, ciudad: "", provincia: "" });
      setModalOpen(false);
    } catch (err: any) {
      console.error("❌ Error al guardar ciudad:", err?.response ?? err);
    }
  };

  const handleEdit = (city) => {
    setForm({ id: city.id, ciudad: city.ciudad, provincia: city.provincia });
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
    (c.provincia ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <CardTitle>Ciudades</CardTitle>
            <CardDescription>Gestión de ciudades y provincias</CardDescription>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar ciudades..."
                className="pl-10 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              onClick={() => {
                setForm({ id: null, ciudad: "", provincia: "" });
                setModalOpen(true);
              }}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Agregar ciudad
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Provincia</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((city) => (
                  <TableRow key={city.id}>
                    <TableCell>{city.id}</TableCell>
                    <TableCell>{city.ciudad}</TableCell>
                    <TableCell>{city.provincia}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(city)}
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(city.id)}
                        >
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
              placeholder="Nombre de la ciudad"
              value={form.ciudad}
              onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
            />
            <Input
              placeholder="Nombre de la provincia"
              value={form.provincia}
              onChange={(e) => setForm({ ...form, provincia: e.target.value })}
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
