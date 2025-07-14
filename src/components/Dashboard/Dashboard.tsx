
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, CheckSquare, Clock } from 'lucide-react';

const Dashboard = () => {
  const { usuario } = useAuth();

  const stats = [
    {
      title: 'Clientes Activos',
      value: '248',
      description: 'Total de clientes registrados',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Visitas Programadas',
      value: '32',
      description: 'Para esta semana',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'Tareas Completadas',
      value: '156',
      description: 'Este mes',
      icon: CheckSquare,
      color: 'text-purple-600'
    },
    {
      title: 'Visitas Pendientes',
      value: '8',
      description: 'Requieren reagendación',
      icon: Clock,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenido, {usuario?.nombre}
        </h1>
        <p className="text-gray-600">
          Panel de control - {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Visitas de Hoy</CardTitle>
            <CardDescription>
              Programación del día actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { cliente: 'Jardines del Norte', equipo: 'Equipo A', hora: '09:00' },
                { cliente: 'Villa Hermosa', equipo: 'Equipo B', hora: '11:30' },
                { cliente: 'Residencial San José', equipo: 'Equipo A', hora: '14:00' },
              ].map((visita, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{visita.cliente}</p>
                    <p className="text-sm text-gray-600">{visita.equipo}</p>
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    {visita.hora}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas acciones del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { accion: 'Visita completada', detalle: 'Jardines del Norte - Equipo A', tiempo: 'Hace 2 horas' },
                { accion: 'Cliente registrado', detalle: 'Nueva Esperanza S.A.', tiempo: 'Hace 4 horas' },
                { accion: 'Visita reagendada', detalle: 'Villa Hermosa - Equipo B', tiempo: 'Hace 6 horas' },
              ].map((actividad, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{actividad.accion}</p>
                    <p className="text-sm text-gray-600">{actividad.detalle}</p>
                    <p className="text-xs text-gray-400">{actividad.tiempo}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
