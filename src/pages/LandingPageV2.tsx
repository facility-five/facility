import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initScrollReveal } from '../utils/scrollReveal';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { DynamicLogo } from "@/components/DynamicLogo";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Building2, 
  Users, 
  Calendar, 
  MessageSquare, 
  Shield, 
  BarChart3,
  CheckCircle,
  Star,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowDownRight,
  Zap,
  Clock,
  Target,
  DollarSign,
  AlertCircle,
  FileText,
  Settings,
  Globe,
  Mail,
  Phone,
  MapPin,
  Check,
  Eye,
  MessageCircle,
  Lightbulb,
  LogIn,
  User,
  LogOut,
} from "lucide-react";

const LandingPageV2 = () => {
  const navigate = useNavigate();
  const { session, profile, signOut } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getUserDashboardRoute = () => {
    console.log('getUserDashboardRoute - session:', session);
    console.log('getUserDashboardRoute - profile:', profile);
    
    if (!profile) {
      console.log('getUserDashboardRoute - No profile found, redirecting to /');
      return '/';
    }
    
    console.log('getUserDashboardRoute - Profile role:', profile.role);
    
    switch (profile.role) {
      case 'Admin do SaaS':
        console.log('getUserDashboardRoute - Redirecting to /admin');
        return '/admin';
      case 'Administrador':
      case 'Administradora':
      case 'Funcionário':
        console.log('getUserDashboardRoute - Redirecting to /gestor');
        return '/gestor';
      case 'Síndico':
        console.log('getUserDashboardRoute - Redirecting to /sindico');
        return '/sindico';
      case 'Morador':
        console.log('getUserDashboardRoute - Redirecting to /morador-dashboard');
        return '/morador-dashboard';
      default:
        console.log('getUserDashboardRoute - Unknown role, redirecting to /');
        return '/';
    }
  };

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Inicializar ScrollReveal
  useEffect(() => {
    initScrollReveal();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("status", "active")
        .order("price", { ascending: true });

      if (!error && data) {
        setPlans(data);
      }
      setLoading(false);
    };
    fetchPlans();
  }, []);

  const filteredPlans = plans.filter((plan) => plan.period === billingCycle);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleStartNow = (plan: any) => {
    try {
      console.log('handleStartNow chamado com plano:', plan);
      console.log('Navigate function:', navigate);
      // Armazenar o plano selecionado no sessionStorage para usar após o cadastro
      sessionStorage.setItem('selected_plan', JSON.stringify(plan));
      console.log('Plano armazenado no sessionStorage');
      // Redirecionar para a página de cadastro
      console.log('Tentando navegar para /criar-conta...');
      navigate('/criar-conta');
      console.log('Navigate chamado com sucesso');
    } catch (error) {
      console.error('Erro em handleStartNow:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 w-full shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <DynamicLogo className="flex-row mb-0 h-16" imageClassName="h-16 w-auto max-h-16" />
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">Características</a>
              <a href="#benefits" className="text-gray-600 hover:text-purple-600 transition-colors">Beneficios</a>
              <a href="#pricing" className="text-gray-600 hover:text-purple-600 transition-colors">Precios</a>
              <a href="#faq" className="text-gray-600 hover:text-purple-600 transition-colors">FAQ</a>
            </nav>
            <div className="flex items-center space-x-4">
              {(() => {
                console.log('Landing Page - Renderização do header:');
                console.log('Session exists:', !!session);
                console.log('Profile exists:', !!profile);
                console.log('Session && Profile:', !!(session && profile));
                return null;
              })()}
              {session && profile ? (
                // Menu de usuário logado
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="ghost" 
                    className="text-gray-600 hover:text-purple-600 rounded-[20px] transition-all duration-500 ease-out hover:scale-105"
                    onClick={() => {
                      try {
                        console.log('Botão "Meu Painel" clicado');
                        console.log('Session:', session);
                        console.log('Profile:', profile);
                        console.log('Navigate function:', navigate);
                        const route = getUserDashboardRoute();
                        console.log('Navegando para:', route);
                        console.log('Tentando navegar...');
                        navigate(route);
                        console.log('Navigate chamado com sucesso');
                      } catch (error) {
                        console.error('Erro ao navegar:', error);
                      }
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Meu Painel
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-gray-600 hover:text-red-600 rounded-[20px] transition-all duration-500 ease-out hover:scale-105"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </div>
              ) : (
                // Botões para usuários não logados
                <>
                  <Button 
                    variant="ghost" 
                    className="text-gray-600 hover:text-purple-600 rounded-[20px] transition-all duration-500 ease-out hover:scale-105"
                    onClick={() => navigate('/login')}
                  >
                    Iniciar Sesión
                    <LogIn className="w-4 h-4 ml-2 transition-transform duration-300 ease-out" />
                  </Button>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-[20px] px-8 transition-all duration-500 ease-out hover:scale-105 hover:shadow-lg"
                    onClick={() => {
                      const pricingSection = document.getElementById('pricing');
                      pricingSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    Crear cuenta
                    <ArrowDownRight className="w-4 h-4 ml-2 transition-transform duration-300 ease-out" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white to-purple-600 overflow-hidden min-h-screen flex items-center">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-[20px] blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-[20px] blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-[20px] blur-3xl"></div>
        </div>

        {/* Floating Badges */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Comunicação Badge - Top Left */}
          <div className="absolute top-20 left-8 lg:left-16 animate-float-1 z-10">
            <div className="relative">
              <div className="bg-purple-50/80 backdrop-blur-sm border border-purple-200 rounded-[20px] px-4 py-2 shadow-lg">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-800">Comunicação</span>
                </div>
              </div>
              {/* Arrow pointing to center */}
              <div className="absolute -bottom-2 -right-2">
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-purple-600 transform rotate-[315deg]"></div>
              </div>
            </div>
          </div>

          {/* Gestão Badge - Top Right */}
          <div className="absolute top-28 right-8 lg:right-16 animate-float-2 z-10">
            <div className="relative">
              <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-[20px] px-4 py-2 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-800">Gestão</span>
                </div>
              </div>
              {/* Arrow pointing to center */}
              <div className="absolute -bottom-2 -left-2">
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-blue-600 transform rotate-[45deg]"></div>
              </div>
            </div>
          </div>

          {/* Reservas Badge - Bottom Left */}
          <div className="absolute bottom-40 left-12 lg:left-20 animate-float-3 z-20">
            <div className="relative">
              <div className="bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-[20px] px-4 py-2 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-800">Reservas</span>
                </div>
              </div>
              {/* Arrow pointing to center */}
              <div className="absolute -top-2 -right-2">
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-green-600 transform rotate-[225deg]"></div>
              </div>
            </div>
          </div>

          {/* Ocorrências Badge - Bottom Right */}
          <div className="absolute bottom-32 right-12 lg:right-20 animate-float-4 z-20">
            <div className="relative">
              <div className="bg-orange-50/80 backdrop-blur-sm border border-orange-200 rounded-[20px] px-4 py-2 shadow-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-800">Ocorrências</span>
                </div>
              </div>
              {/* Arrow pointing to center */}
              <div className="absolute -top-2 -left-2">
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-orange-600 transform rotate-[135deg]"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Badge className="mb-6 bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200">
              ✨ Gestión fácil, moderna y eficiente para tu condominio.
            </Badge>
            <h1 className="title-50px font-bold text-gray-900 mb-6">
              Gestión de Condominios
              <span className="block bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                Inteligente con Facility Fincas
              </span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
              Automatiza tareas, mejora la comunicación y simplifica el día a día de tu condominio con nuestra plataforma completa y fácil de usar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-purple-600 text-white hover:bg-purple-700 font-semibold px-8 py-4 rounded-[20px] transition-all duration-500 ease-out hover:scale-105 hover:shadow-xl"
                onClick={() => {
                  console.log('🔗 Botão "Crear cuenta" (hero) clicado');
                  console.log('🧭 Navegando para: /registrarse');
                  try {
                    navigate('/registrarse');
                    console.log('✅ Navegação para /registrarse bem-sucedida');
                  } catch (error) {
                    console.error('❌ Erro na navegação para /registrarse:', error);
                  }
                }}
              >
                Crear cuenta
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 ease-out" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-4 rounded-[20px] transition-all duration-500 ease-out hover:scale-105 hover:shadow-lg"
                onClick={() => {
                  console.log('🔗 Botão "Solicitar demostración" clicado');
                  console.log('🧭 Navegando para: /contacto');
                  try {
                    navigate('/contacto');
                    console.log('✅ Navegação para /contacto bem-sucedida');
                  } catch (error) {
                    console.error('❌ Erro na navegação para /contacto:', error);
                  }
                }}
              >
                Solicitar demostración
                <MessageSquare className="ml-2 h-5 w-5 transition-transform duration-300 ease-out" />
              </Button>
            </div>
            <div className="flex items-center justify-center space-x-8 text-gray-600 mb-12">

            </div>
            
            {/* Dashboard Preview - Expanded with 3D Effects and Entrance Animation */}
            <div className="relative w-full max-w-[1200px] mx-auto px-2 perspective-[1000px] animate-slide-up-fade">
              <div 
                className="bg-white/10 backdrop-blur-lg rounded-[20px] p-3 border border-white/20 w-full transform-gpu group"
                style={{
                  transformStyle: 'preserve-3d',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
                }}
              >
              <div 
                className="bg-white rounded-[20px] shadow-2xl overflow-hidden transform-gpu animate-slide-up-fade-delay"
                style={{
                  transformStyle: 'preserve-3d',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
              >
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-[20px]"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-[20px]"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-[20px]"></div>
                      </div>
                      <span className="text-sm text-gray-500">Sistema de Gestión - Condominio Vista Bella</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-6 animate-dashboard-header">
                      <h3 className="text-lg font-semibold text-gray-900">Panel Principal</h3>
                      <Badge className="bg-green-100 text-green-800">En línea</Badge>
                    </div>
                    
                    {/* Stats Grid - Modernized with more widgets and 3D effects */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6 animate-dashboard-stats">
                      <div className="bg-purple-50 p-4 rounded-[20px] animate-slide-up-fade-card-1">
                        <div className="flex items-start justify-between">
                          <div className="text-left">
                            <p className="text-sm text-gray-600">Unidades Activas</p>
                            <p className="text-2xl font-bold text-purple-600">248</p>
                          </div>
                          <Building2 className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-[20px] animate-slide-up-fade-card-2">
                        <div className="flex items-start justify-between">
                          <div className="text-left">
                            <p className="text-sm text-gray-600">Residentes</p>
                            <p className="text-2xl font-bold text-blue-600">1,247</p>
                          </div>
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-[20px] animate-slide-up-fade-card-3">
                        <div className="flex items-start justify-between">
                          <div className="text-left">
                            <p className="text-sm text-gray-600">Solicitudes</p>
                            <p className="text-2xl font-bold text-green-600">34</p>
                          </div>
                          <FileText className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-[20px] animate-slide-up-fade-card-4">
                        <div className="flex items-start justify-between">
                          <div className="text-left">
                            <p className="text-sm text-gray-600">Pendientes</p>
                            <p className="text-2xl font-bold text-orange-600">12</p>
                          </div>
                          <AlertCircle className="h-6 w-6 text-orange-600" />
                        </div>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-[20px] animate-slide-up-fade-card-5">
                        <div className="flex items-start justify-between">
                          <div className="text-left">
                            <p className="text-sm text-gray-600">Reservas Hoy</p>
                            <p className="text-2xl font-bold text-indigo-600">8</p>
                          </div>
                          <Calendar className="h-6 w-6 text-indigo-600" />
                        </div>
                      </div>
                      <div className="bg-pink-50 p-4 rounded-[20px] animate-slide-up-fade-card-6">
                        <div className="flex items-start justify-between">
                          <div className="text-left">
                            <p className="text-sm text-gray-600">Visitantes</p>
                            <p className="text-2xl font-bold text-pink-600">23</p>
                          </div>
                          <Users className="h-6 w-6 text-pink-600" />
                        </div>
                      </div>
                    </div>

                    {/* Two Column Layout for better space utilization */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-dashboard-content">
                      {/* Recent Activity */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900">Actividades Recientes</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-[20px]">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-green-500 rounded-[20px]"></div>
                              <span className="text-sm text-gray-700">Solicitud de Mantenimiento #1247</span>
                            </div>
                            <span className="text-xs text-gray-500">2 min</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-[20px]">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-[20px]"></div>
                              <span className="text-sm text-gray-700">Nuevo Registro - Apt 304</span>
                            </div>
                            <span className="text-xs text-gray-500">5 min</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-[20px]">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-purple-500 rounded-[20px]"></div>
                              <span className="text-sm text-gray-700">Reserva Salón de Fiestas</span>
                            </div>
                            <span className="text-xs text-gray-500">18 min</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-[20px]">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-indigo-500 rounded-[20px]"></div>
                              <span className="text-sm text-gray-700">Comunicado Enviado</span>
                            </div>
                            <span className="text-xs text-gray-500">25 min</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions & Status */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Acciones Rápidas</h4>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <button className="flex items-center justify-center p-3 bg-purple-100 text-purple-700 rounded-[20px] transform-gpu transition-all duration-300 ease-out hover:bg-purple-200 hover:rotate-x-[2deg] hover:rotate-y-[2deg] hover:scale-105 hover:shadow-lg hover:translate-z-[5px]" style={{transformStyle: 'preserve-3d'}}>
                            <FileText className="h-5 w-5 mr-2 transition-all duration-300 ease-out hover:scale-110" />
                            <span className="text-sm transition-colors duration-300 ease-out">Reportes</span>
                          </button>
                          <button className="flex items-center justify-center p-3 bg-blue-100 text-blue-700 rounded-[20px] transform-gpu transition-all duration-300 ease-out hover:bg-blue-200 hover:rotate-x-[2deg] hover:rotate-y-[2deg] hover:scale-105 hover:shadow-lg hover:translate-z-[5px]" style={{transformStyle: 'preserve-3d'}}>
                            <MessageSquare className="h-5 w-5 mr-2 transition-all duration-300 ease-out hover:scale-110" />
                            <span className="text-sm transition-colors duration-300 ease-out">Comunicados</span>
                          </button>
                          <button className="flex items-center justify-center p-3 bg-green-100 text-green-700 rounded-[20px] transform-gpu transition-all duration-300 ease-out hover:bg-green-200 hover:rotate-x-[2deg] hover:rotate-y-[2deg] hover:scale-105 hover:shadow-lg hover:translate-z-[5px]" style={{transformStyle: 'preserve-3d'}}>
                            <Calendar className="h-5 w-5 mr-2 transition-all duration-300 ease-out hover:scale-110" />
                            <span className="text-sm transition-colors duration-300 ease-out">Reservas</span>
                          </button>
                          <button className="flex items-center justify-center p-3 bg-orange-100 text-orange-700 rounded-[20px] transform-gpu transition-all duration-300 ease-out hover:bg-orange-200 hover:rotate-x-[2deg] hover:rotate-y-[2deg] hover:scale-105 hover:shadow-lg hover:translate-z-[5px]" style={{transformStyle: 'preserve-3d'}}>
                            <Settings className="h-5 w-5 mr-2 transition-all duration-300 ease-out hover:scale-110" />
                            <span className="text-sm transition-colors duration-300 ease-out">Configuración</span>
                          </button>
                        </div>
                        
                        {/* System Status Widget */}
                        <div className="bg-gray-50 p-4 rounded-[20px] transform-gpu transition-all duration-300 ease-out hover:shadow-lg hover:scale-105 hover:translate-z-[5px]" style={{transformStyle: 'preserve-3d'}}>
                          <h5 className="text-sm font-semibold text-gray-900 mb-3 transition-colors duration-300 ease-out">Estado del Sistema</h5>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">Servidor Principal</span>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-[20px] mr-2"></div>
                                <span className="text-xs text-green-600">Activo</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">Base de Datos</span>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-[20px] mr-2"></div>
                                <span className="text-xs text-green-600">Activo</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">Notificaciones</span>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-yellow-500 rounded-[20px] mr-2"></div>
                                <span className="text-xs text-yellow-600">Mantenimiento</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Text below dashboard */}
            <div className="text-center mt-8">
              <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '18px' }}>
                Gestiona todo en un solo lugar — desde reservas, asambleas y comunicación con los residentes.
              </p>
              
              {/* Highlights list */}
              <div className="flex flex-wrap justify-center items-center gap-8 mt-8">
                <div 
                  className="flex items-center space-x-2 cursor-pointer"
                  onMouseEnter={(e) => {
                    const icon = e.currentTarget.querySelector('svg');
                    const span = e.currentTarget.querySelector('span');
                    if (icon) icon.style.color = '#ffffff';
                    if (span) span.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    const icon = e.currentTarget.querySelector('svg');
                    const span = e.currentTarget.querySelector('span');
                    if (icon) icon.style.color = 'rgba(255, 255, 255, 0.5)';
                    if (span) span.style.color = 'rgba(255, 255, 255, 0.5)';
                  }}
                >
                  <Settings className="w-5 h-5 transition-colors duration-300" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                  <span 
                    className="transition-colors duration-300" 
                    style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '20px' }}
                  >
                    Automatización
                  </span>
                </div>
                
                <div 
                  className="flex items-center space-x-2 cursor-pointer"
                  onMouseEnter={(e) => {
                    const icon = e.currentTarget.querySelector('svg');
                    const span = e.currentTarget.querySelector('span');
                    if (icon) icon.style.color = '#ffffff';
                    if (span) span.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    const icon = e.currentTarget.querySelector('svg');
                    const span = e.currentTarget.querySelector('span');
                    if (icon) icon.style.color = 'rgba(255, 255, 255, 0.5)';
                    if (span) span.style.color = 'rgba(255, 255, 255, 0.5)';
                  }}
                >
                  <Eye className="w-5 h-5 transition-colors duration-300" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                  <span 
                    className="transition-colors duration-300" 
                    style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '20px' }}
                  >
                    Transparencia
                  </span>
                </div>
                
                <div 
                  className="flex items-center space-x-2 cursor-pointer"
                  onMouseEnter={(e) => {
                    const icon = e.currentTarget.querySelector('svg');
                    const span = e.currentTarget.querySelector('span');
                    if (icon) icon.style.color = '#ffffff';
                    if (span) span.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    const icon = e.currentTarget.querySelector('svg');
                    const span = e.currentTarget.querySelector('span');
                    if (icon) icon.style.color = 'rgba(255, 255, 255, 0.5)';
                    if (span) span.style.color = 'rgba(255, 255, 255, 0.5)';
                  }}
                >
                  <MessageCircle className="w-5 h-5 transition-colors duration-300" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                  <span 
                    className="transition-colors duration-300" 
                    style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '20px' }}
                  >
                    Comunicación
                  </span>
                </div>
                
                <div 
                  className="flex items-center space-x-2 cursor-pointer"
                  onMouseEnter={(e) => {
                    const icon = e.currentTarget.querySelector('svg');
                    const span = e.currentTarget.querySelector('span');
                    if (icon) icon.style.color = '#ffffff';
                    if (span) span.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    const icon = e.currentTarget.querySelector('svg');
                    const span = e.currentTarget.querySelector('span');
                    if (icon) icon.style.color = 'rgba(255, 255, 255, 0.5)';
                    if (span) span.style.color = 'rgba(255, 255, 255, 0.5)';
                  }}
                >
                  <Zap className="w-5 h-5 transition-colors duration-300" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                  <span 
                    className="transition-colors duration-300" 
                    style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '20px' }}
                  >
                    Eficiencia
                  </span>
                </div>
                
                <div 
                  className="flex items-center space-x-2 cursor-pointer"
                  onMouseEnter={(e) => {
                    const icon = e.currentTarget.querySelector('svg');
                    const span = e.currentTarget.querySelector('span');
                    if (icon) icon.style.color = '#ffffff';
                    if (span) span.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    const icon = e.currentTarget.querySelector('svg');
                    const span = e.currentTarget.querySelector('span');
                    if (icon) icon.style.color = 'rgba(255, 255, 255, 0.5)';
                    if (span) span.style.color = 'rgba(255, 255, 255, 0.5)';
                  }}
                >
                  <Shield className="w-5 h-5 transition-colors duration-300" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                  <span 
                    className="transition-colors duration-300" 
                    style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '20px' }}
                  >
                    Seguridad
                  </span>
                </div>
                
                <div 
                  className="flex items-center space-x-2 cursor-pointer"
                  onMouseEnter={(e) => {
                    const icon = e.currentTarget.querySelector('svg');
                    const span = e.currentTarget.querySelector('span');
                    if (icon) icon.style.color = '#ffffff';
                    if (span) span.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    const icon = e.currentTarget.querySelector('svg');
                    const span = e.currentTarget.querySelector('span');
                    if (icon) icon.style.color = 'rgba(255, 255, 255, 0.5)';
                    if (span) span.style.color = 'rgba(255, 255, 255, 0.5)';
                  }}
                >
                  <Lightbulb className="w-5 h-5 transition-colors duration-300" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                  <span 
                    className="transition-colors duration-300" 
                    style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '20px' }}
                  >
                    Innovación
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funciones Principales */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="title-40px font-bold text-gray-900 mb-4">Funciones Principales</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Todo lo que necesitas para administrar tu condominio con eficiencia y transparencia.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Settings className="w-8 h-8" />,
                title: "Automatización Inteligente",
                description: "Automatiza tareas repetitivas y flujos de trabajo con sistemas inteligentes impulsados por IA"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Colaboración de Equipos",
                description: "Herramientas de colaboración fluidas para equipos distribuidos y partes interesadas"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Seguridad Empresarial",
                description: "Seguridad de nivel bancario con cifrado avanzado y funciones de cumplimiento"
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Analítica Avanzada",
                description: "Información profunda y reportes para tomar decisiones basadas en datos"
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Actualizaciones en Tiempo Real",
                description: "Sincronización en vivo y actualizaciones instantáneas en todas las plataformas"
              },
              {
                icon: <MessageSquare className="w-8 h-8" />,
                title: "Soporte Multilingüe",
                description: "Traducción y localización integradas para audiencias globales"
              }
            ].map((feature, index) => (
              <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 ease-out bg-white hover:scale-105 hover:-translate-y-2" style={{ borderRadius: '20px' }}>
                <CardHeader>
                  <div className="w-16 h-16 bg-purple-100 rounded-[20px] flex items-center justify-center mb-4 text-purple-600 transition-all duration-300 ease-out group-hover:bg-purple-200">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 transition-colors duration-300 ease-out">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="title-40px font-bold text-gray-900 mb-4">
              Todas las herramientas de UI que necesitas,
              <span className="block">en un solo lugar</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sistema de diseño integral con componentes, plantillas y herramientas para aplicaciones modernas
            </p>
          </div>
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-[20px] p-8 shadow-2xl">
            <div className="bg-white rounded-[20px] shadow-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-[20px]"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-[20px]"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-[20px]"></div>
                  <span className="ml-4 text-gray-600 text-sm">Interfaz del Panel</span>
                </div>
                <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-[400px]">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="bg-white rounded-[20px] p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-900">Resumen de Analítica</h3>
                          <Badge variant="secondary">En vivo</Badge>
                        </div>
                        <div className="h-32 bg-gradient-to-r from-purple-100 to-blue-100 rounded-[20px] flex items-center justify-center">
                          <BarChart3 className="w-12 h-12 text-purple-600" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-[20px] p-4 shadow-sm">
                          <div className="text-2xl font-bold text-gray-900">2.4k</div>
                          <div className="text-sm text-gray-600">Usuarios Activos</div>
                        </div>
                        <div className="bg-white rounded-[20px] p-4 shadow-sm">
                          <div className="text-2xl font-bold text-gray-900">98.5%</div>
                          <div className="text-sm text-gray-600">Disponibilidad</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white rounded-[20px] p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-3">Actividad Reciente</h3>
                        <div className="space-y-2">
                          {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-[20px] flex items-center justify-center">
                                <Users className="w-4 h-4 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">Acción de Usuario {item}</div>
                                <div className="text-xs text-gray-500">Hace 2 min</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="title-40px font-bold mb-4">
              Por qué las mejores empresas de
              <span className="block">todos los tamaños nos eligen</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Únete a miles de empresas que confían en nuestra plataforma para su transformación digital
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg-grid-cols-3 gap-8">
            {[
              {
                color: "from-purple-500 to-pink-500",
                icon: <Star className="w-8 h-8" />,
                title: "99,9% de Disponibilidad",
                description: "Fiabilidad de nivel empresarial con disponibilidad garantizada y monitoreo 24/7"
              },
              {
                color: "from-blue-500 to-cyan-500",
                icon: <Shield className="w-8 h-8" />,
                title: "Seguridad de Nivel Bancario",
                description: "Cifrado avanzado, certificaciones de cumplimiento y auditorías de seguridad"
              },
              {
                color: "from-green-500 to-emerald-500",
                icon: <Users className="w-8 h-8" />,
                title: "Soporte Experto",
                description: "Equipo de soporte dedicado con tiempo de respuesta promedio inferior a 2 horas"
              }
            ].map((benefit, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-2 hover:shadow-2xl">
                <CardHeader>
                  <div className={`w-16 h-16 bg-gradient-to-r ${benefit.color} rounded-[20px] flex items-center justify-center mb-4 text-white transition-transform duration-300 ease-out hover:scale-110`}>
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-white transition-colors duration-300 ease-out">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 text-base leading-relaxed">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="title-40px font-bold text-gray-900 mb-4">Lo que dicen nuestros usuarios</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre cómo las empresas transforman sus operaciones con nuestra plataforma
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Product Manager",
                company: "TechCorp",
                content: "Esta plataforma ha revolucionado cómo gestionamos nuestros productos digitales. Las funciones de IA nos ahorran horas cada semana.",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "CTO",
                company: "StartupXYZ",
                content: "Las funciones de traducción nos ayudaron a expandirnos globalmente en solo 3 meses. ROI y experiencia de usuario increíbles.",
                rating: 5
              },
              {
                name: "Emily Rodriguez",
                role: "Design Lead",
                company: "DesignStudio",
                content: "Los componentes de UI y el sistema de diseño son de primera. La productividad de nuestro equipo aumentó un 40%.",
                rating: 5
              },
              {
                name: "David Kim",
                role: "Engineering Manager",
                company: "ScaleUp Inc",
                content: "La seguridad y la fiabilidad son excelentes. No hemos tenido tiempo de inactividad desde que cambiamos a esta plataforma.",
                rating: 5
              },
              {
                name: "Lisa Wang",
                role: "Marketing Director",
                company: "GrowthCo",
                content: "La analítica y las perspectivas nos ayudan a tomar mejores decisiones. Nuestras tasas de conversión mejoraron significativamente.",
                rating: 5
              },
              {
                name: "James Wilson",
                role: "Founder",
                company: "InnovateLab",
                content: "La mejor inversión que hemos hecho. La plataforma escala con nuestro negocio y el equipo de soporte es increíble.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-gray-700 text-base leading-relaxed">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-[20px] flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-sm">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role} en {testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="title-40px font-bold text-gray-900 mb-4">
              Nuestros Planes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Comienza tu viaje de gestión con Facility Fincas
            </p>
            
            {/* Toggle de período */}
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gray-100 p-1 rounded-[20px]">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-6 py-2 rounded-[20px] text-sm font-medium transition-all ${
                    billingCycle === "monthly"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={`px-6 py-2 rounded-[20px] text-sm font-medium transition-all ${
                    billingCycle === "annual"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Anual
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="border-0 shadow-lg animate-pulse">
                  <CardHeader className="text-center pb-8">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                    <div className="h-10 bg-gray-200 rounded mt-8"></div>
                  </CardContent>
                </Card>
              ))
            ) : filteredPlans.length > 0 ? (
              filteredPlans.map((plan, index) => (
                <Card key={plan.id} className={`relative border-0 shadow-lg hover:shadow-2xl transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-3 ${index === 1 ? 'ring-2 ring-purple-500 scale-105' : ''}`}>
                  {index === 1 && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 transition-transform duration-300 ease-out">
                      <Badge className="bg-purple-500 text-white px-4 py-1 transition-all duration-300 ease-out hover:bg-purple-600">Más Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold text-gray-900 transition-colors duration-300 ease-out">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900 transition-colors duration-300 ease-out">
                        {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(plan.price)}
                      </span>
                      <span className="text-gray-600 transition-colors duration-300 ease-out">/{plan.period === "monthly" ? "mes" : "año"}</span>
                    </div>
                    <CardDescription className="text-gray-600 mt-2 transition-colors duration-300 ease-out">{plan.description || ""}</CardDescription>
                    <Button 
                      className={`w-full mt-6 rounded-[20px] transition-all duration-500 ease-out hover:scale-105 hover:shadow-lg ${index === 1 ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                      size="lg"
                      onClick={() => handleStartNow(plan)}
                    >
                      Comenzar Ahora
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {(plan.features || []).map((feature: string, featureIndex: number) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Fallback para quando não há planos
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 text-lg">No hay planes disponibles en este momento.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="title-40px font-bold text-gray-900 mb-4">Preguntas Frecuentes</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Todo lo que necesitas saber sobre nuestra plataforma y servicios
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4 sr-stagger">
            {[
              {
                question: "¿Cómo funciona la función de traducción con IA?",
                answer: "Nuestro sistema de traducción con IA utiliza modelos avanzados de aprendizaje automático para ofrecer traducciones precisas y con contexto en tiempo real. Aprende de los patrones de tu contenido y mantiene la coherencia en toda tu plataforma."
              },
              {
                question: "¿Puedo integrar con mis herramientas existentes?",
                answer: "¡Sí! Ofrecemos APIs completas e integraciones preconstruidas con herramientas populares como Slack, GitHub, Figma y más. Nuestra plataforma está diseñada para funcionar sin fricciones con tu flujo de trabajo existente."
              },
              {
                question: "¿Qué tipo de soporte ofrecen?",
                answer: "Brindamos soporte 24/7 para clientes Enterprise, soporte prioritario para planes Professional y soporte por correo electrónico para planes Starter. Todos los clientes tienen acceso a nuestra documentación completa y foros de la comunidad."
              },
              {
                question: "¿Mis datos están seguros?",
                answer: "Por supuesto. Usamos cifrado de nivel bancario, auditorías de seguridad periódicas y cumplimos con SOC 2, GDPR y otros estándares de la industria. Tus datos se almacenan en centros de datos seguros y distribuidos geográficamente."
              },
              {
                question: "¿Puedo cancelar mi suscripción en cualquier momento?",
                answer: "Sí, puedes cancelar tu suscripción en cualquier momento. No hay contratos a largo plazo ni tarifas de cancelación. Mantendrás acceso a tu cuenta hasta el final del período de facturación actual."
              }
            ].map((faq, index) => (
              <Card key={index} className="border border-gray-200 transition-all duration-300 ease-out hover:shadow-lg hover:border-purple-200">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-all duration-300 ease-out hover:bg-purple-50"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900 text-left transition-colors duration-300 ease-out">{faq.question}</CardTitle>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 transition-all duration-300 ease-out hover:text-purple-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 transition-all duration-300 ease-out hover:text-purple-600" />
                    )}
                  </div>
                </CardHeader>
                {expandedFaq === index && (
                  <CardContent className="pt-0 animate-in slide-in-from-top-2 duration-300 ease-out">
                    <p className="text-gray-600 leading-relaxed transition-colors duration-300 ease-out">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 sr-fade-up">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <DynamicLogo className="flex-row mb-4 h-16" imageClassName="h-16 w-auto max-h-16" />
              <p className="text-gray-400 mb-4">
                Transforma tu presencia digital con sistemas de diseño inteligentes y experiencias multilingües sin fricción.
              </p>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-800 rounded-[20px] flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-xs">tw</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-[20px] flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-xs">li</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-[20px] flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-xs">gh</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4 transition-colors duration-300 ease-out">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-all duration-300 ease-out hover:translate-x-1">Características</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 ease-out hover:translate-x-1">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 ease-out hover:translate-x-1">API</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 ease-out hover:translate-x-1">Documentación</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 transition-colors duration-300 ease-out">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-all duration-300 ease-out hover:translate-x-1">Acerca de</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 ease-out hover:translate-x-1">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 ease-out hover:translate-x-1">Carreras</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 ease-out hover:translate-x-1">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 transition-colors duration-300 ease-out">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-all duration-300 ease-out hover:translate-x-1">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 ease-out hover:translate-x-1">Comunidad</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 ease-out hover:translate-x-1">Estado</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 ease-out hover:translate-x-1">Seguridad</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm transition-colors duration-300 ease-out">
              © 2024 Facility. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-all duration-300 ease-out hover:translate-x-1">Política de Privacidad</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-all duration-300 ease-out hover:translate-x-1">Términos del Servicio</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-all duration-300 ease-out hover:translate-x-1">Política de Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6 group-hover:animate-bounce" />
        </button>
      )}
    </div>
  );
};

export default LandingPageV2;