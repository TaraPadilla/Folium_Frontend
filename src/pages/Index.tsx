
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Login from '@/components/Login';
import Navbar from '@/components/Layout/Navbar';
import Sidebar from '@/components/Layout/Sidebar';
import Dashboard from '@/components/Dashboard/Dashboard';
import GestionClientes from '@/components/Clientes/GestionClientes';
import HojaRuta from '@/components/HojaRuta/HojaRuta';
import ProgramacionVisitas from '@/components/Visitas/ProgramacionVisitas';

const Index = () => {
  const { usuario, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center">
          <div className="text-4xl mb-4">🌿</div>
          <p className="text-gray-600">Cargando GardenCare Pro...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'clientes':
        return <GestionClientes />;
      case 'hoja-ruta':
        return <HojaRuta />;
      case 'visitas-hoy':
        return <HojaRuta />;
      case 'visitas':
        return <ProgramacionVisitas />;
      case 'prospectos':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Gestión de Prospectos</h1>
            <p className="text-gray-600">Módulo de prospectos en desarrollo...</p>
          </div>
        );
      case 'equipos':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Gestión de Equipos</h1>
            <p className="text-gray-600">Módulo de equipos en desarrollo...</p>
          </div>
        );
      case 'tareas':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Gestión de Tareas</h1>
            <p className="text-gray-600">Módulo de tareas en desarrollo...</p>
          </div>
        );
      case 'usuarios':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Gestión de Usuarios</h1>
            <p className="text-gray-600">Módulo de usuarios en desarrollo...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 w-full transition-all duration-300">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
