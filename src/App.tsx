
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "./pages/NotFound";
import LoginForm from "./components/Login";
import AdminPanel from "./components/admin/AdminPanel";
import GestionClientes from "./components/Clientes/GestionClientes";
import CotizacionesList from "./components/Cotizaciones/CotizacionesList";
import CrearCotizacion from "./components/Cotizaciones/CrearCotizacion";
import { Navigate, Outlet } from "react-router-dom";
import AppLayout from "./components/Layout/AppLayout";
import Dashboard from "./components/Dashboard/Dashboard";
import { useAuth } from "@/contexts/AuthContext";

// Create QueryClient outside of component to avoid recreating on every render
  const queryClient = new QueryClient();
  const RequireAuth = () => {
    const { token, isLoadingAuth } = useAuth();
    console.log('RequireAuth | token:', token, '| isLoadingAuth:', isLoadingAuth);
    if (isLoadingAuth) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <span style={{ fontSize: 20, marginBottom: 8 }}>Cargando autenticación...</span>
          {/* Aquí puedes reemplazar por un spinner visual si tienes uno */}
        </div>
      );
    }

    if (!token) {
      console.log('RequireAuth | No token, redirigiendo a /login');
      return <Navigate to="/login" replace />;
    }

    return <Outlet />;
  };

  const App = () => {
    // Protección simple: reemplazar por contexto de autenticación en el futuro
  return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              {/* Rutas protegidas */}
              <Route element={<RequireAuth />}>
                  <Route path="/" element={<AppLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="admin" element={<AdminPanel />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="catalogos" element={<AdminPanel />} />
                    <Route path="clientes" element={<GestionClientes />} />
<Route path="cotizaciones" element={<CotizacionesList />} />
<Route path="cotizaciones/nueva" element={<CrearCotizacion />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
              </Route>
            </Routes>
            </BrowserRouter>
            <Toaster />
            <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
  );
};

export default App;
