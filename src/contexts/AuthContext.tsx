
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario } from '@/types';

interface AuthContextType {
  usuario: Usuario | null;
  iniciarSesion: (email: string, password: string) => Promise<boolean>;
  cerrarSesion: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for development
const mockUsers: Usuario[] = [
  {
    id: '1',
    nombre: 'Administrador Sistema',
    email: 'admin@jardineria.com',
    rol: 'administrador',
    activo: true,
    fechaRegistro: '2024-01-01'
  },
  {
    id: '2',
    nombre: 'María López',
    email: 'maria@jardineria.com',
    rol: 'operador_logistico',
    activo: true,
    fechaRegistro: '2024-01-15'
  },
  {
    id: '3',
    nombre: 'Carlos Hernández',
    email: 'carlos@jardineria.com',
    rol: 'encargado',
    equipoId: '1',
    activo: true,
    fechaRegistro: '2024-02-01'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const iniciarSesion = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock authentication
    const user = mockUsers.find(u => u.email === email && u.activo);
    
    if (user) {
      setUsuario(user);
      localStorage.setItem('usuario', JSON.stringify(user));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const cerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
  };

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
