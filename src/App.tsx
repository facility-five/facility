import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext"; // Alterado de "./contexts/AuthContext" para "@/contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute";
import InactiveOverlay from "./components/InactiveOverlay";
import SystemTitle from "./components/SystemTitle";

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
import ResetPassword from "./pages/ResetPassword";
import RegisterAdministrator from "./pages/RegisterAdministrator";

import ResidentReservations from "./pages/resident/Reservations";
import ResidentCommunications from "./pages/resident/Communications";
import ResidentRequests from "./pages/resident/Requests";
import ResidentUnit from "./pages/resident/Unit";
import ResidentDocuments from "./pages/resident/Documents";
import ResidentProfile from "./pages/resident/Profile";
import ResidentSettings from "./pages/resident/Settings";

import ManagerCondominios from "./pages/manager/Condominios";
import ManagerConfiguracoes from "./pages/manager/Configuracoes";
import ManagerPlan from "./pages/manager/Plan";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SystemTitle />
          <Routes future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Route path="/" element={<Index />} />
            <Route path="/setup-master" element={<SetupMaster />} />
            <Route path="/criar-conta" element={<SignUp />} />
            <Route path="/recuperar-senha" element={<ForgotPassword />} />
            <Route path="/verificar-email" element={<VerifyEmail />} />
            <Route path="/nova-senha" element={<ResetPassword />} />
            <Route path="/planos" element={<Plans />} />
            <Route path="/acesso-morador" element={<ResidentAccess />} />
            
            <Route element={<ProtectedRoute allowedRoles={['Administradora', 'Síndico']} />}>
              <Route path="/gestor-dashboard" element={<ManagerDashboard />} />
              <Route path="/gestor/condominios" element={<ManagerCondominios />} />
              <Route path="/gestor/configuracoes" element={<ManagerConfiguracoes />} />
              <Route path="/gestor/plan" element={<ManagerPlan />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['Morador']} />}>
              <Route path="/morador-dashboard" element={<ResidentDashboard />} />
              <Route path="/morador/reservas" element={<ResidentReservations />} />
              <Route path="/morador/comunicados" element={<ResidentCommunications />} />
              <Route path="/morador/solicitudes" element={<ResidentRequests />} />
              <Route path="/morador/unidade" element={<ResidentUnit />} />
              <Route path="/morador/documentos" element={<ResidentDocuments />} />
              <Route path="/morador/perfil" element={<ResidentProfile />} />
              <Route path="/morador/configuracoes" element={<ResidentSettings />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['Administrador']} />}>
              <Route path="/registrar-administradora" element={<RegisterAdministrator />} />
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
          <InactiveOverlay />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;