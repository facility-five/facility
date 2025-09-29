import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Plans from "./pages/Plans";
import Dashboard from "./pages/admin/Dashboard";
import MyAccount from "./pages/admin/MyAccount";
import Administrators from "./pages/admin/Administrators";
import Condominios from "./pages/admin/Condominios";
import Blocks from "./pages/admin/Blocks";
import Units from "./pages/admin/Units";
import CommonAreas from "./pages/admin/CommonAreas";
import Communications from "./pages/admin/Communications";
import Users from "./pages/admin/Users";
import AdminPlans from "./pages/admin/Plans";
import Payments from "./pages/admin/Payments";
import Settings from "./pages/admin/Settings";
import Notifications from "./pages/admin/Notifications";
import ManagerDashboard from "./pages/ManagerDashboard";
import ResidentDashboard from "./pages/ResidentDashboard";
import ResidentAccess from "./pages/ResidentAccess";
import SetupMaster from "./pages/SetupMaster";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Route path="/" element={<Index />} />
            <Route path="/setup-master" element={<SetupMaster />} />
            <Route path="/criar-conta" element={<SignUp />} />
            <Route path="/recuperar-senha" element={<ForgotPassword />} />
            <Route path="/verificar-email" element={<VerifyEmail />} />
            <Route path="/planos" element={<Plans />} />
            <Route path="/acesso-morador" element={<ResidentAccess />} />
            
            <Route path="/gestor-dashboard" element={<ProtectedRoute allowedRoles={['Gestor']}><ManagerDashboard /></ProtectedRoute>} />
            <Route path="/morador-dashboard" element={<ProtectedRoute allowedRoles={['Usuário']}><ResidentDashboard /></ProtectedRoute>} />

            <Route element={<ProtectedRoute allowedRoles={['Administrador']} />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/minha-conta" element={<MyAccount />} />
              <Route path="/admin/administradoras" element={<Administrators />} />
              <Route path="/admin/condominios" element={<Condominios />} />
              <Route path="/admin/bloques" element={<Blocks />} />
              <Route path="/admin/unidades" element={<Units />} />
              <Route path="/admin/areas-comunes" element={<CommonAreas />} />
              <Route path="/admin/comunicados" element={<Communications />} />
              <Route path="/admin/usuarios" element={<Users />} />
              <Route path="/admin/planes" element={<AdminPlans />} />
              <Route path="/admin/pagos" element={<Payments />} />
              <Route path="/admin/configuracoes" element={<Settings />} />
              <Route path="/admin/notificacoes" element={<Notifications />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;