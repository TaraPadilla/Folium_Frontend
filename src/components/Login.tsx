import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/services/api/AuthService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const authService = new AuthService();

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log(email, password);
      const response = await authService.login(email, password);
      console.log(response);
      if (response?.token && response?.usuario) {
        login(response.token, response.usuario);
        toast({
          title: "Bienvenido",
          description: `Has iniciado sesión correctamente`,
        });
        navigate('/');
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.mensaje || "Ocurrió un error al intentar iniciar sesión";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">🌿</div>
          <CardTitle className="text-2xl text-green-700">Folium Paisajismo & Servicios</CardTitle>
          <CardDescription>
            Sistema de Gestión de Mantenimiento de Jardinería
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="usuario@jardineria.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 text-sm text-gray-600">
            <p className="font-medium mb-2">Usuarios de prueba:</p>
            <div className="space-y-1">
              <p><strong>Admin:</strong> admin@jardineria.com</p>
              <p><strong>Operador:</strong> maria@jardineria.com</p>
              <p><strong>Encargado:</strong> carlos@jardineria.com</p>
            </div>
            <p className="mt-2 text-xs">Cualquier contraseña funciona</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
