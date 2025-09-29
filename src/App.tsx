import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import AdminPlans from "./pages/admin/Plans";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/criar-conta" element={<SignUp />} />
          <Route path="/recuperar-senha" element={<ForgotPassword />} />
          <Route path="/verificar-email" element={<VerifyEmail />} />
          <Route path="/planos" element={<Plans />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/minha-conta" element={<MyAccount />} />
          <Route path="/admin/administradoras" element={<Administrators />} />
          <Route path="/admin/condominios" element={<Condominios />} />
          <Route path="/admin/bloques" element={<Blocks />} />
          <Route path="/admin/unidades" element={<Units />} />
          <Route path="/admin/areas-comunes" element={<CommonAreas />} />
          <Route path="/admin/planes" element={<AdminPlans />} />
          <Route path="/admin/configuracoes" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;