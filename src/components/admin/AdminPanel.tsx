import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon, SettingsIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UsuarioService } from "@/services/api/UsuarioService";
import { CityService } from "@/services/api/CityService";
import CityTab from "./tabs/CityTab";
import PlanesTab from "./tabs/PlanesTab";
import TareaTab from "./tabs/TareaTab";
import EquipoTab from "./tabs/EquipoTab";

const cityService = new CityService();
const userService = new UsuarioService();

const AdminPanel: React.FC = () => {
  const [searchTerms, setSearchTerms] = useState({
    users: "",
    cities: "",
  });

  const [cities, setCities] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const handleSearchChange = (tab: string, value: string) => {
    setSearchTerms(prev => ({ ...prev, [tab]: value }));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cities, users] = await Promise.all([
          cityService.getAll(),
          userService.getAll(),
        ]);
        setCities(Array.isArray(cities) ? cities : []);
        setUsers(Array.isArray(users) ? users : []);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de administración</h1>
          <p className="text-muted-foreground">Gestión de datos de referencia y usuarios del sistema</p>
        </div>
      </div>

      <Tabs defaultValue="planes">
        <TabsList className="flex flex-wrap gap-2 mb-6">
          <TabsTrigger value="planes">Tipo de Servicio</TabsTrigger>
          <TabsTrigger value="tareas">Tarea</TabsTrigger>
          <TabsTrigger value="equipos">Equipos</TabsTrigger>
          <TabsTrigger value="cities">Ciudades</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="planes"><PlanesTab /></TabsContent>
          <TabsContent value="tareas"><TareaTab /></TabsContent>
          <TabsContent value="equipos"><EquipoTab /></TabsContent>
          <TabsContent value="cities"><CityTab /></TabsContent>
        </div>
      </Tabs> 
    </div>
  );
};

export default AdminPanel;