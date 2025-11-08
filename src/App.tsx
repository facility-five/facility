import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ManagerAdministradorasProvider } from "@/contexts/ManagerAdministradorasContext";
import SystemTitle from "./components/SystemTitle";
import { ThemeProvider } from "@/components/theme-provider"; // Importar ThemeProvider
import ProtectedRoute from "./components/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import SignUpDetails from "./pages/SignUpDetails";
import ForgotPassword from "./pages/ForgotPassword";
import EmailConfirmation from "./pages/EmailConfirmation";
import Plans from "./pages/Plans";
import Dashboard from "./pages/admin/Dashboard";
import MyAccount from "./pages/admin/MyAccount";
import Administrators from "./pages/admin/Administrators";
import Condominios from "./pages/admin/Condominios";
import Blocks from "./pages/admin/Blocks";
import Units from "./pages/admin/Units";
import CommonAreas from "./pages/admin/CommonAreas";
import Users from "./pages/admin/Users";
import AdminPlans from "./pages/admin/Plans";
import Payments from "./pages/admin/Payments";
import Settings from "./pages/admin/Settings";
import Notifications from "./pages/admin/Notifications";
import ManagerDashboard from "./pages/ManagerDashboard";
import ResidentDashboard from "./pages/ResidentDashboard";
import ResidentAccess from "./pages/ResidentAccess";

import ResetPassword from "./pages/ResetPassword";
import RegisterAdministrator from "./pages/RegisterAdministrator";
import DesignSystem from "./pages/DesignSystem";
import TestToast from "./pages/TestToast";
import Login from "./pages/Login"; // Importar o componente Login

import ResidentReservations from "./pages/resident/Reservations";
import ResidentCommunications from "./pages/resident/Communications";
import ResidentRequests from "./pages/resident/Requests";
import ResidentUnit from "./pages/resident/Unit";
import ResidentDocuments from "./pages/resident/Documents";
import ResidentProfile from "./pages/resident/Profile";
import ResidentSettings from "./pages/resident/Settings";

import ManagerAdministradoras from "./pages/manager/Administradoras";
import ManagerCondominios from "./pages/manager/Condominios";
import ManagerConfiguracoes from "./pages/manager/Configuracoes";
import ManagerResidentes from "./pages/manager/Residentes";
import ManagerPlan from "./pages/manager/Plan";
import MiPlan from "./pages/manager/MiPlan";
import ManagerComunicados from "./pages/manager/Comunicados";
import ManagerAreasComuns from "./pages/manager/AreasComuns";
import ManagerReservas from "./pages/manager/Reservas";
import ManagerVehiculos from "./pages/manager/Vehiculos";
import ManagerBlocos from "./pages/manager/Blocos";
import ManagerUnidades from "./pages/manager/Unidades";
import ManagerMascotas from "./pages/manager/Mascotas";
import SyndicDashboard from "./pages/sindico/Dashboard";
import LandingPageSettings from "./pages/admin/LandingPageSettings";
import LandingPageV2 from "./pages/LandingPageV2";
import Contacto from "./pages/Contacto";
import Leads from "./pages/admin/Leads";
import ResidentsManagement from "./pages/admin/ResidentsManagement";
import Soporte from "./pages/admin/Soporte";
import Tareas from "./pages/admin/Tareas";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider forcedTheme="light" enableSystem={false} attribute="class">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <SystemTitle />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/landing-v2" element={<LandingPageV2 />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/login" element={<Login />} /> {/* Nova rota para a pagina de login */}
              <Route path="/registrarse" element={<SignUp />} />
              <Route path="/registrarse/datos" element={<SignUpDetails />} />
              <Route path="/recuperar-senha" element={<ForgotPassword />} />
              <Route path="/nova-senha" element={<ResetPassword />} />
              <Route path="/nueva-contrasena" element={<ResetPassword />} />
              <Route path="/planes" element={<Plans />} />
              <Route path="/email-confirmation" element={<EmailConfirmation />} />
              <Route path="/acesso-morador" element={<ResidentAccess />} />
              <Route path="/test-toast" element={<TestToast />} />
              
              {/* Rotas do Gestor (protegidas) */}
              <Route
                path="/gestor"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>
                    <ManagerAdministradorasProvider>
                      <ManagerDashboard />
                    </ManagerAdministradorasProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>
                    <ManagerAdministradorasProvider>
                      <ManagerDashboard />
                    </ManagerAdministradorasProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/administradoras"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>
                    <ManagerAdministradorasProvider>
                      <ManagerAdministradoras />
                    </ManagerAdministradorasProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/condominios"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>
                    <ManagerAdministradorasProvider>
                      <ManagerCondominios />
                    </ManagerAdministradorasProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/residentes"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>
                    <ManagerAdministradorasProvider>
                      <ManagerResidentes />
                    </ManagerAdministradorasProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/configuracoes"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>
                    <ManagerAdministradorasProvider>
                      <ManagerConfiguracoes />
                    </ManagerAdministradorasProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/mi-plan"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>
                    <ManagerAdministradorasProvider>
                      <MiPlan />
                    </ManagerAdministradorasProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/comunicados"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>
                    <ManagerAdministradorasProvider>
                      <ManagerComunicados />
                    </ManagerAdministradorasProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/areas-comuns"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>
                    <ManagerAdministradorasProvider>
                      <ManagerAreasComuns />
                    </ManagerAdministradorasProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/reservas"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>
                    <ManagerAdministradorasProvider>
                      <ManagerReservas />
                    </ManagerAdministradorasProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/vehiculos"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>
                    <ManagerAdministradorasProvider>
                      <ManagerVehiculos />
                    </ManagerAdministradorasProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/blocos"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Funcionario"]}>
                    <ManagerAdministradorasProvider>
                      <ManagerBlocos />
                    </ManagerAdministradorasProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/unidades"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Funcionario"]}>
                    <ManagerAdministradorasProvider>
                      <ManagerUnidades />
                    </ManagerAdministradorasProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/mascotas"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Funcionario"]}>
                    <ManagerAdministradorasProvider>
                      <ManagerMascotas />
                    </ManagerAdministradorasProvider>
                  </ProtectedRoute>
                }
              />
              {/* Rotas do Sindico (protegidas) */}
              <Route
                path="/sindico"
                element={
                  <ProtectedRoute allowedRoles={["Sindico"]}>
                    <SyndicDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Rotas do Morador (protegidas) */}
              <Route
                path="/morador-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["Morador"]}>
                    <ResidentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/morador/reservas"
                element={
                  <ProtectedRoute allowedRoles={["Morador"]}>
                    <ResidentReservations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/morador/comunicados"
                element={
                  <ProtectedRoute allowedRoles={["Morador"]}>
                    <ResidentCommunications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/morador/solicitudes"
                element={
                  <ProtectedRoute allowedRoles={["Morador"]}>
                    <ResidentRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/morador/unidade"
                element={
                  <ProtectedRoute allowedRoles={["Morador"]}>
                    <ResidentUnit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/morador/documentos"
                element={
                  <ProtectedRoute allowedRoles={["Morador"]}>
                    <ResidentDocuments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/morador/perfil"
                element={
                  <ProtectedRoute allowedRoles={["Morador"]}>
                    <ResidentProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/morador/configuracoes"
                element={
                  <ProtectedRoute allowedRoles={["Morador"]}>
                    <ResidentSettings />
                  </ProtectedRoute>
                }
              />

              {/* Rotas do Admin do SaaS (protegidas) */}
              <Route
                path="/registrar-administradora"
                element={
                  <ProtectedRoute allowedRoles={["Administradora"]} allowWithoutProfile>
                    <RegisterAdministrator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/minha-conta"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <MyAccount />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/administradoras"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Administrators />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/condominios"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Condominios />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bloques"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Blocks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/unidades"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Units />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/areas-comunes"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <CommonAreas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/usuarios"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/planes"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <AdminPlans />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pagos"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Payments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/configuracoes"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notificacoes"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pagina"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <LandingPageSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/clientes-potenciales"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Leads />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/moradores"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <ResidentsManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/design-system"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <DesignSystem />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/soporte"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Soporte />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tareas"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Tareas />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
