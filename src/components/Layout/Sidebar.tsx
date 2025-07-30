
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Users, 
  Calendar, 
  CheckSquare, 
  User, 
  Settings,
  UserPlus,
  MapPin,
  Clock,
  Menu,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(() => window.innerWidth >= 768);

  const getMenuItems = () => {
    if (usuario?.rol === 'admin') {
      return [
        { 
          id: 'gestion', 
          label: 'Gestión', 
          icon: Settings,
          children: [
            { id: 'dashboard', label: 'Dashboard', icon: Settings },
            { id: 'clientes', label: 'Clientes', icon: Users },
            { id: 'cotizaciones', label: 'Presupuestos', icon: CheckSquare },
            { id: 'contratos', label: 'Contratos', icon: CheckSquare },
            { id: 'catalogos', label: 'Catálogos', icon: Settings },
            { id: 'usuarios', label: 'Usuarios', icon: Settings },
          ]
        },
        { 
          id: 'operaciones', 
          label: 'Operaciones', 
          icon: Calendar,
          children: [
            { id: 'equipos', label: 'Equipos', icon: User },
            { id: 'tareas', label: 'Tareas', icon: CheckSquare },
            { id: 'visitas', label: 'Programación', icon: Calendar },
          ]
        }
      ];
    }

    if (usuario?.rol === 'operador_logistico') {
      return [
        { 
          id: 'operaciones', 
          label: 'Operaciones', 
          icon: Calendar,
          children: [
            { id: 'dashboard', label: 'Dashboard', icon: Settings },
            { id: 'clientes', label: 'Clientes', icon: Users },
            { id: 'cotizaciones', label: 'Presupuestos', icon: CheckSquare },
            { id: 'contratos', label: 'Contratos', icon: CheckSquare },
            { id: 'visitas', label: 'Programación', icon: Calendar },
            { id: 'equipos', label: 'Equipos', icon: User },
            { id: 'tareas', label: 'Tareas', icon: CheckSquare },
          ]
        }
      ];
    }

    if (usuario?.rol === 'encargado') {
      return [
        { id: 'hoja-ruta', label: 'Mi Hoja de Ruta', icon: MapPin },
        { id: 'visitas-hoy', label: 'Visitas de Hoy', icon: Clock },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  const handleMenuItemClick = (itemId: string) => {
    setActiveTab(itemId);
    // No cerrar el sidebar automáticamente al hacer clic
    navigate(`/${itemId}`);
  };

  return (
    <>
      {/* Hamburger Menu Button - Fixed position */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-4 z-50 bg-white shadow-md hover:bg-gray-50"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        bg-gradient-to-b from-green-50 to-green-100 
        fixed inset-y-0 left-0 z-40
        w-64 min-h-screen p-4 shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
        ${isOpen ? 'md:w-64' : 'md:w-0 md:overflow-hidden'}
      `}>
        <div className={`${!isOpen ? 'md:hidden' : ''}`}>
          {/* Header */}
          <div className="mb-6 pt-8 md:pt-0">
            <div className="text-xs text-green-600 font-medium mb-2">
              {usuario?.rol?.replace('_', ' ').toUpperCase()}
            </div>
            <div className="text-gray-600 text-sm truncate">
              {usuario?.nombre}
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {usuario?.rol === 'encargado' ? (
              // Simple menu for encargado
              menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start text-sm ${
                    activeTab === item.id 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'text-green-700 hover:bg-green-200'
                  }`}
                  onClick={() => handleMenuItemClick(item.id)}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              ))
            ) : (
              // Accordion menu for admin and operator
              <Accordion type="multiple" className="w-full" defaultValue={menuItems.map(s => s.id)}>
                {menuItems.map((section) => (
                  <AccordionItem key={section.id} value={section.id} className="border-none">
                    <AccordionTrigger className="text-green-700 hover:text-green-800 hover:bg-green-200 px-3 py-2 rounded-md text-sm font-medium">
                      <div className="flex items-center">
                        <section.icon className="mr-3 h-4 w-4" />
                        {section.label}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-2">
                      <div className="space-y-1 ml-4">
                        {section.children?.map((item) => (
                          <Button
                            key={item.id}
                            variant={activeTab === item.id ? "default" : "ghost"}
                            className={`w-full justify-start text-sm ${
                              activeTab === item.id 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : 'text-green-700 hover:bg-green-200'
                            }`}
                            onClick={() => handleMenuItemClick(item.id)}
                          >
                            <item.icon className="mr-3 h-4 w-4" />
                            {item.label}
                          </Button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
