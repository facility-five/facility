import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ManagerAdministradorasProvider } from "@/contexts/ManagerAdministradorasContext";
import SystemTitle from "./components/SystemTitle";
import { ThemeProvider } from "@/components/theme-provider";
import ProtectedRoute from "./components/ProtectedRoute";
import { Suspense, lazy } from "react";
import { AppLoader } from "./components/AppLoader";
import { SuspenseFallback } from "./components/SuspenseFallback";

// Imports críticos (sempre carregados)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import SignUpDetails from "./pages/SignUpDetails";
import ForgotPassword from "./pages/ForgotPassword";
import EmailConfirmation from "./pages/EmailConfirmation";
import Plans from "./pages/Plans";
import ResetPassword from "./pages/ResetPassword";
import Login from "./pages/Login";
import { AuthCallback } from "@/components/AuthCallback";
import ResidentAccess from "./pages/ResidentAccess";
import TestToast from "./pages/TestToast";
import LandingPageV2 from "./pages/LandingPageV2";
import Contacto from "./pages/Contacto";

// Lazy imports - Gestor
const ManagerDashboard = lazy(() => import("./pages/ManagerDashboard"));
const ManagerAdministradoras = lazy(() => import("./pages/manager/Administradoras"));
const ManagerCondominios = lazy(() => import("./pages/manager/Condominios"));
const ManagerConfiguracoes = lazy(() => import("./pages/manager/Configuracoes"));
const ManagerResidentes = lazy(() => import("./pages/manager/Residentes"));
const MiPlan = lazy(() => import("./pages/manager/MiPlan"));
const ManagerComunicados = lazy(() => import("./pages/manager/Comunicados"));
const ManagerAreasComuns = lazy(() => import("./pages/manager/AreasComuns"));
const ManagerReservas = lazy(() => import("./pages/manager/Reservas"));
const ManagerVehiculos = lazy(() => import("./pages/manager/Vehiculos"));
const ManagerBlocos = lazy(() => import("./pages/manager/Blocos"));
const ManagerUnidades = lazy(() => import("./pages/manager/Unidades"));
const ManagerMascotas = lazy(() => import("./pages/manager/Mascotas"));

// Lazy imports - Admin
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const MyAccount = lazy(() => import("./pages/admin/MyAccount"));
const Administrators = lazy(() => import("./pages/admin/Administrators"));
const Condominios = lazy(() => import("./pages/admin/Condominios"));
const Blocks = lazy(() => import("./pages/admin/Blocks"));
const Units = lazy(() => import("./pages/admin/Units"));
const CommonAreas = lazy(() => import("./pages/admin/CommonAreas"));
const Users = lazy(() => import("./pages/admin/Users"));
const AdminPlans = lazy(() => import("./pages/admin/Plans"));
const Payments = lazy(() => import("./pages/admin/Payments"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const Notifications = lazy(() => import("./pages/admin/Notifications"));
const LandingPageSettings = lazy(() => import("./pages/admin/LandingPageSettings"));
const Leads = lazy(() => import("./pages/admin/Leads"));
const ResidentsManagement = lazy(() => import("./pages/admin/ResidentsManagement"));
const Soporte = lazy(() => import("./pages/admin/Soporte"));
const Tareas = lazy(() => import("./pages/admin/Tareas"));
const DesignSystem = lazy(() => import("./pages/DesignSystem"));

// Lazy imports - Resident
const ResidentDashboard = lazy(() => import("./pages/ResidentDashboard"));
const ResidentReservations = lazy(() => import("./pages/resident/Reservations"));
const ResidentCommunications = lazy(() => import("./pages/resident/Communications"));
const ResidentRequests = lazy(() => import("./pages/resident/Requests"));
const ResidentUnit = lazy(() => import("./pages/resident/Unit"));
const ResidentDocuments = lazy(() => import("./pages/resident/Documents"));
const ResidentProfile = lazy(() => import("./pages/resident/Profile"));
const ResidentSettings = lazy(() => import("./pages/resident/Settings"));

// Lazy imports - Syndic
const SyndicDashboard = lazy(() => import("./pages/sindico/Dashboard"));
const RegisterAdministrator = lazy(() => import("./pages/RegisterAdministrator"));

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
            <AppLoader>
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
                <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* Rotas do Gestor (protegidas) */}
              <Route
                path="/gestor"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <ManagerDashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <ManagerDashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/administradoras"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>

                      <Suspense fallback={<SuspenseFallback />}>
                        <ManagerAdministradoras />
                      </Suspense>

                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/condominios"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>

                      <Suspense fallback={<SuspenseFallback />}>
                        <ManagerCondominios />
                      </Suspense>

                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/residentes"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>

                      <Suspense fallback={<SuspenseFallback />}>
                        <ManagerResidentes />
                      </Suspense>

                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/configuracoes"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>

                      <Suspense fallback={<SuspenseFallback />}>
                        <ManagerConfiguracoes />
                      </Suspense>

                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/mi-plan"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>

                      <Suspense fallback={<SuspenseFallback />}>
                        <MiPlan />
                      </Suspense>

                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/comunicados"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>

                      <Suspense fallback={<SuspenseFallback />}>
                        <ManagerComunicados />
                      </Suspense>

                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/areas-comuns"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>

                      <Suspense fallback={<SuspenseFallback />}>
                        <ManagerAreasComuns />
                      </Suspense>

                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/reservas"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>

                      <Suspense fallback={<SuspenseFallback />}>
                        <ManagerReservas />
                      </Suspense>

                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/vehiculos"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Administrador", "Funcionario"]}>

                      <Suspense fallback={<SuspenseFallback />}>
                        <ManagerVehiculos />
                      </Suspense>

                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/blocos"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Funcionario"]}>

                      <Suspense fallback={<SuspenseFallback />}>
                        <ManagerBlocos />
                      </Suspense>

                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/unidades"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Funcionario"]}>

                      <Suspense fallback={<SuspenseFallback />}>
                        <ManagerUnidades />
                      </Suspense>

                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor/mascotas"
                element={
                  <ProtectedRoute allowedRoles={["Administradora", "Funcionario"]}>

                      <Suspense fallback={<SuspenseFallback />}>
                        <ManagerMascotas />
                      </Suspense>

                  </ProtectedRoute>
                }
              />
              {/* Rotas do Sindico (protegidas) */}
              <Route
                path="/sindico"
                element={
                  <ProtectedRoute allowedRoles={["Sindico"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <SyndicDashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              
              {/* Rotas do Morador (protegidas) */}
              <Route
                path="/morador-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["Morador"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <ResidentDashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/morador/reservas"
                element={
                  <ProtectedRoute allowedRoles={["Morador"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <ResidentReservations />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/morador/comunicados"
                element={
                  <ProtectedRoute allowedRoles={["Morador"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <ResidentCommunications />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/morador/solicitudes"
                element={
                  <ProtectedRoute allowedRoles={["Morador"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <ResidentRequests />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/morador/unidade"
                element={
                  <ProtectedRoute allowedRoles={["Morador"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <ResidentUnit />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/morador/documentos"
                element={
                  <ProtectedRoute allowedRoles={["Morador"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <ResidentDocuments />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/morador/perfil"
                element={
                  <ProtectedRoute allowedRoles={["Morador"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <ResidentProfile />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/morador/configuracoes"
                element={
                  <ProtectedRoute allowedRoles={["Morador"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <ResidentSettings />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* Rotas do Admin do SaaS (protegidas) */}
              <Route
                path="/registrar-administradora"
                element={
                  <ProtectedRoute allowedRoles={["Administradora"]} allowWithoutProfile>
                    <Suspense fallback={<SuspenseFallback />}>
                      <RegisterAdministrator />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <Dashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/minha-conta"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <MyAccount />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/administradoras"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <Administrators />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/condominios"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <Condominios />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bloques"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <Blocks />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/unidades"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <Units />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/areas-comunes"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <CommonAreas />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/usuarios"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <Users />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/planes"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <AdminPlans />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pagos"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <Payments />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/configuracoes"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <Settings />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notificacoes"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <Notifications />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pagina"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <LandingPageSettings />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/clientes-potenciales"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <Leads />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/moradores"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <ResidentsManagement />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/design-system"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <DesignSystem />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/soporte"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <Soporte />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tareas"
                element={
                  <ProtectedRoute allowedRoles={["Admin do SaaS"]}>
                    <Suspense fallback={<SuspenseFallback />}>
                      <Tareas />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
                </Routes>

            </AppLoader>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
