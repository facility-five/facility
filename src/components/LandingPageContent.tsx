"use client";

import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Check, 
  MessageSquare, 
  Zap, 
  Users, 
  DollarSign, 
  Star, 
  CalendarCheck, 
  Wrench, 
  Megaphone, 
  BarChart3, 
  ShieldCheck, 
  LogOut, 
  LogIn,
  User as UserIcon, 
  LayoutGrid, 
  Building, 
  Settings, 
  CalendarClock, 
  ClipboardList,
  Smartphone,
  Bell,
  MessageCircle,
  CreditCard,
  Cloud,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Calendar,
  Shield
} from "lucide-react";
import { DynamicLogo } from "./DynamicLogo";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { PlanCard } from "./PlanCard";
import { LoadingSpinner } from "./LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from 'react-i18next';
import { createLandingPageTable } from "@/utils/createLandingPageTable";

type DbPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  period: string;
  status: string;
  features: string[] | null;
  stripe_price_id: string | null;
};

interface LandingPageConfig {
  hero_title?: string;
  hero_subtitle?: string;
  hero_cta_text?: string;
  hero_image_primary?: string;
  hero_image_secondary?: string;
  features?: Array<{
    title: string;
    description: string;
  }>;
  testimonials?: Array<{
    name: string;
    role: string;
    building: string;
    rating: number;
    text: string;
    avatar?: string;
  }>;
  is_active?: boolean;
  maintenance_mode?: boolean;
  contact_email?: string;
  contact_phone?: string;
  page_title?: string;
  meta_description?: string;
}

const normalizeRole = (role: string) =>
  role
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z\s]/g, "")
    .trim()
    .toLowerCase();

const LandingPageContent = () => {
  const { t } = useTranslation();
  const { session, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [plans, setPlans] = useState<DbPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [landingConfig, setLandingConfig] = useState<LandingPageConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const plansSectionRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // Load landing page configuration from database
  useEffect(() => {
    const loadLandingConfig = async () => {
      try {
        setIsLoading(true);
        
        // Ensure table exists
        await createLandingPageTable();
        
        // Fetch configuration
        const { data, error } = await supabase
          .from('landing_page_settings')
          .select('*')
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error loading landing page config:', error);
        } else if (data) {
          setLandingConfig(data);
        }
      } catch (error) {
        console.error('Error loading landing page config:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLandingConfig();
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true);
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("status", "active")
        .order("price", { ascending: true });

      if (error) {
        showRadixError("Erro ao carregar planos.");
      } else {
        setPlans(data || []);
      }
      setLoadingPlans(false);
    };
    fetchPlans();
  }, []);

  const filteredPlans = React.useMemo(
    () => plans.filter((p) => p.period === billingCycle),
    [plans, billingCycle]
  );

  const menuItems = React.useMemo(() => {
    if (!profile) return [];

    const adminMenu = [
      { label: "Panel administrativo", path: "/admin", Icon: LayoutGrid },
      { label: "Administradoras", path: "/admin/administradoras", Icon: Building },
      { label: "Configuracion", path: "/admin/configuracoes", Icon: Settings },
      { label: "Mi cuenta", path: "/admin/minha-conta", Icon: UserIcon },
    ];

    const managerMenu = [
      { label: "Panel de gestion", path: "/gestor", Icon: LayoutGrid },
      { label: "Condominios", path: "/gestor/condominios", Icon: Building },
      { label: "Planes y pagos", path: "/gestor/mi-plan", Icon: CalendarClock },
      { label: "Configuracion", path: "/gestor/configuracoes", Icon: Settings },
    ];

    const syndicMenu = [
      { label: "Painel do síndico", path: "/sindico", Icon: LayoutGrid },
      { label: "Blocos", path: "/sindico/blocos", Icon: Building },
      { label: "Comunicados", path: "/sindico/comunicados", Icon: Megaphone },
    ];

    const residentMenu = [
      { label: "Panel del residente", path: "/morador-dashboard", Icon: LayoutGrid },
      { label: "Reservas", path: "/morador/reservas", Icon: CalendarCheck },
      { label: "Documentos", path: "/morador/documentos", Icon: ClipboardList },
      { label: "Perfil", path: "/morador/perfil", Icon: UserIcon },
    ];

    const normalizedRole = normalizeRole(profile.role);

    switch (normalizedRole) {
      case "admin do saas":
        return adminMenu;
      case "administradora":
        return managerMenu;
      case "sindico":
        return syndicMenu;
      case "funcionario":
      case "funcionrio":
        return managerMenu;
      case "morador":
        return residentMenu;
      default:
        return [];
    }
  }, [profile]);

  const scrollToPlans = () => {
    if (plansSectionRef.current) {
      plansSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = async () => {
    await signOut();
    showRadixSuccess("Has cerrado la sesion!");
    navigate("/");
  };

  // Default data (fallback when no config is saved)
  const defaultFeatures = [
    {
      icon: MessageSquare,
      title: "Comunicação Integrada",
      description: "Centralize avisos, comunicados e conversas em um só lugar. Mantenha todos informados de forma eficiente."
    },
    {
      icon: DollarSign,
      title: "Gestão Financeira",
      description: "Controle completo de receitas, despesas e inadimplência. Relatórios detalhados e transparentes."
    },
    {
      icon: Users,
      title: "Gestão de Moradores",
      description: "Cadastro completo de moradores, visitantes e prestadores de serviço com controle de acesso."
    },
    {
      icon: Calendar,
      title: "Reserva de Espaços",
      description: "Sistema inteligente para reserva de áreas comuns com calendário integrado e regras personalizáveis."
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Dados protegidos com criptografia avançada e backup automático. Sua informação sempre segura."
    },
    {
      icon: Smartphone,
      title: "Acesso Mobile",
      description: "Aplicativo nativo para iOS e Android. Gerencie seu condomínio de qualquer lugar, a qualquer hora."
    }
  ];

  const highlights = [
    {
      icon: Smartphone,
      title: "Interface Responsiva",
      description: "Acessível de qualquer dispositivo, a qualquer hora"
    },
    {
      icon: Bell,
      title: "Alertas Automáticos",
      description: "Lembretes e notificações inteligentes"
    },
    {
      icon: MessageCircle,
      title: "Chat Interno",
      description: "Comunicação direta entre moradores e síndico"
    },
    {
      icon: CreditCard,
      title: "Gestão Financeira Simplificada",
      description: "Controle total de receitas e despesas"
    },
    {
      icon: Cloud,
      title: "Armazenamento em Nuvem",
      description: "Segurança e disponibilidade 24h"
    }
  ];

  const defaultTestimonials = [
    {
      name: "Carlos Silva",
      role: "Síndico",
      building: "Residencial Jardim das Flores",
      rating: 5,
      text: "Revolucionou nossa administração! Agora tudo é mais organizado e transparente.",
      avatar: "/api/placeholder/60/60"
    },
    {
      name: "Maria Santos",
      role: "Administradora",
      building: "Condomínio Vista Alegre",
      rating: 5,
      text: "A plataforma é intuitiva e completa. Nossos clientes adoraram a modernização!",
      avatar: "/api/placeholder/60/60"
    },
    {
      name: "Ana Costa",
      role: "Moradora",
      building: "Edifício Central Park",
      rating: 5,
      text: "Muito prático poder acompanhar tudo pelo celular. A comunicação melhorou muito!",
      avatar: "/api/placeholder/60/60"
    }
  ];

  // Use config data or fallback to defaults
  const features = landingConfig?.features || defaultFeatures;
  const testimonials = landingConfig?.testimonials || defaultTestimonials;
  const heroTitle = landingConfig?.hero_title || "Gerencie seu condomínio de forma inteligente e moderna";
  const heroSubtitle = landingConfig?.hero_subtitle || "Centralize a comunicação, controle financeiro e gestão de tarefas em um único sistema completo.";
  const heroCTAText = landingConfig?.hero_cta_text || "Solicitar Demonstração";

  const planData = [
    {
      name: "Básico",
      price: "R$ 199",
      period: "/mês",
      features: [
        "Até 50 unidades",
        "Comunicados básicos",
        "Gestão financeira simples",
        "Suporte por email"
      ],
      highlighted: false
    },
    {
      name: "Profissional",
      price: "R$ 399",
      period: "/mês",
      features: [
        "Até 200 unidades",
        "Comunicados avançados",
        "Gestão financeira completa",
        "Chat interno",
        "Relatórios detalhados",
        "Suporte prioritário"
      ],
      highlighted: true
    },
    {
      name: "Corporativo",
      price: "R$ 699",
      period: "/mês",
      features: [
        "Unidades ilimitadas",
        "Todos os recursos",
        "API personalizada",
        "Integração com sistemas",
        "Suporte 24/7",
        "Treinamento incluído"
      ],
      highlighted: false
    }
  ];

  const faqData = [
    {
      question: "Como funciona o período de teste?",
      answer: "Oferecemos 30 dias gratuitos para você testar todas as funcionalidades da plataforma sem compromisso."
    },
    {
      question: "Posso gerenciar mais de um condomínio?",
      answer: "Sim! Nossa plataforma permite gerenciar múltiplos condomínios em uma única conta, com painéis separados para cada um."
    },
    {
      question: "O sistema é compatível com dispositivos móveis?",
      answer: "Totalmente! Nossa interface é responsiva e funciona perfeitamente em smartphones, tablets e computadores."
    },
    {
      question: "Como é feito o suporte técnico?",
      answer: "Oferecemos suporte via chat, email e telefone. Planos superiores incluem suporte prioritário e 24/7."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-violet-100 text-gray-900 overflow-x-hidden">
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 z-50 w-full glass backdrop-blur-md border-b border-white/20"
      >
        <div className="mx-auto flex w-full max-w-7xl items-center gap-6 px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <DynamicLogo className="mb-0 h-[3rem]" imageClassName="h-[3rem] w-auto max-h-[3rem]" />
          </Link>
          <div className="hidden md:flex flex-1 justify-center space-x-8 text-sm font-medium text-gray-700">
            <Link to="#produto" className="hover:text-[var(--glass-primary)] transition-colors duration-300">Produto</Link>
            <Link to="#funcionalidades" className="hover:text-[var(--glass-primary)] transition-colors duration-300">Funcionalidades</Link>
            <Link to="#depoimentos" className="hover:text-[var(--glass-primary)] transition-colors duration-300">Depoimentos</Link>
            <button onClick={scrollToPlans} className="hover:text-[var(--glass-primary)] transition-colors duration-300">Planos</button>
            <Link to="#contato" className="hover:text-[var(--glass-primary)] transition-colors duration-300">Contato</Link>
          </div>
          <div className="flex items-center space-x-4">
            {session && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 cursor-pointer glass-hover p-3 rounded-xl">
                    <Avatar>
                      <AvatarImage src={profile.avatar_url || undefined} alt={profile.first_name} />
                      <AvatarFallback className="bg-[var(--glass-primary)] text-white">
                        {profile.first_name?.charAt(0) || profile.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {profile.first_name} {profile.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{profile.role}</p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass border-white/20">
                  <DropdownMenuLabel className="text-gray-900">
                    {t('navigation.myAccount')}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/20" />
                  {menuItems.map((item) => (
                    <DropdownMenuItem
                      key={item.path}
                      className="focus:bg-white/10 focus:text-gray-900 py-3"
                      onClick={() => navigate(item.path)}
                    >
                      <item.Icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem className="focus:bg-red-500/10 focus:text-red-600 py-3 text-red-600" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('auth.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-[var(--glass-primary)] transition-colors duration-300 flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Entrar
                </Link>
                <Button className="gradient-primary text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300 animate-glow">
                  Começar Agora
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-violet-600/20 to-indigo-600/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--glass-primary)]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            <motion.h1 
               initial={{ y: 50, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ duration: 0.8, delay: 0.4 }}
               className="hero-title text-5xl lg:text-7xl font-bold mb-6 leading-tight"
             >
               <span className="text-gradient">{heroTitle.split(' ')[0]}</span> {heroTitle.split(' ').slice(1).join(' ')}
             </motion.h1>
            
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl text-gray-600 mb-8 max-w-2xl"
            >
              {heroSubtitle}
            </motion.p>
            
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button className="gradient-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 animate-glow">
                {heroCTAText}
              </Button>
              <Button variant="outline" className="glass-hover px-8 py-4 rounded-xl font-semibold text-lg border-white/30 text-gray-700">
                Saiba Mais
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative"
          >
            <motion.div 
              style={{ y }}
              className="glass p-8 rounded-3xl animate-float"
            >
              <div className="bg-gradient-to-br from-[var(--glass-primary)] to-purple-600 p-6 rounded-2xl text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Dashboard</h3>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Comunicados Ativos</span>
                      <span className="font-bold">12</span>
                    </div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Receita Mensal</span>
                      <span className="font-bold">R$ 45.230</span>
                    </div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Unidades Ativas</span>
                      <span className="font-bold">156</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quem Somos Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gradient">
                Soluções criadas para síndicos e administradoras modernas
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                O Facility Fincas é uma plataforma desenvolvida para simplificar o dia a dia da administração condominial. 
                Reduza a burocracia, aumente a transparência e melhore a comunicação entre moradores e administradores.
              </p>
            </div>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="glass p-8 rounded-3xl"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[var(--glass-primary)] mb-2">500+</div>
                  <div className="text-gray-600">Condomínios</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[var(--glass-primary)] mb-2">50k+</div>
                  <div className="text-gray-600">Usuários</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[var(--glass-primary)] mb-2">99.9%</div>
                  <div className="text-gray-600">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[var(--glass-primary)] mb-2">24/7</div>
                  <div className="text-gray-600">Suporte</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section id="funcionalidades" className="py-20 px-4 bg-gradient-to-r from-purple-50/50 to-violet-50/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gradient">
              Tudo o que você precisa para gerenciar seu condomínio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Funcionalidades completas e integradas para uma gestão eficiente e moderna
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = defaultFeatures[index]?.icon || MessageSquare;
              return (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass glass-hover p-8 rounded-3xl text-center group"
                >
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[var(--glass-primary)] to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Destaques do Produto */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gradient">
              Por que escolher o Facility Fincas?
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass glass-hover p-6 rounded-2xl"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--glass-primary)] to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <highlight.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-gray-900">{highlight.title}</h3>
                    <p className="text-gray-600">{highlight.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="py-20 px-4 bg-gradient-to-r from-violet-50/50 to-purple-50/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gradient">
              O que nossos clientes dizem
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="glass glass-hover p-8 rounded-3xl"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--glass-primary)] to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-xs text-gray-500">{testimonial.building}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section ref={plansSectionRef} className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gradient">
              Escolha o plano ideal para o seu condomínio
            </h2>
            <p className="text-xl text-gray-600">
              Planos flexíveis que crescem com suas necessidades
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {planData.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`glass glass-hover p-8 rounded-3xl relative ${
                  plan.highlighted ? 'ring-2 ring-[var(--glass-primary)] animate-glow' : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="gradient-primary text-white px-4 py-2 rounded-full text-sm font-bold">
                      Mais Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-[var(--glass-primary)]">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                  plan.highlighted 
                    ? 'gradient-primary text-white hover:shadow-xl animate-glow' 
                    : 'glass-hover border border-[var(--glass-primary)] text-[var(--glass-primary)]'
                }`}>
                  Contratar
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-50/50 to-violet-50/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gradient">
              Perguntas Frequentes
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors duration-300"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                    openFaq === index ? 'rotate-180' : ''
                  }`} />
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-gray-600">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-br from-[var(--glass-primary)] to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Pronto para transformar a gestão do seu condomínio?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Solicite uma demonstração e veja o Facility Fincas em ação.
            </p>
            <Button className="bg-white text-[var(--glass-primary)] px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Phone className="w-5 h-5 mr-2" />
              Falar com um Especialista
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden">
        {/* Background with glassmorphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/90 to-violet-900/80"></div>
        <div className="absolute inset-0 backdrop-blur-sm bg-black/20"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--glass-primary)]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[var(--glass-secondary)]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 text-white py-20 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Main footer content */}
            <div className="grid lg:grid-cols-5 md:grid-cols-3 gap-12 mb-16">
              {/* Company Info */}
              <motion.div 
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <DynamicLogo className="mb-6 h-[3.5rem]" imageClassName="h-[3.5rem] w-auto max-h-[3.5rem]" />
                <p className="text-gray-300 mb-6 text-lg leading-relaxed max-w-md">
                  Revolucionando a gestão condominial com tecnologia inteligente, 
                  transparência total e experiência excepcional para síndicos, 
                  administradoras e moradores.
                </p>
                
                {/* Social Media */}
                <div className="flex gap-4 mb-8">
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 glass-light rounded-full cursor-pointer group"
                  >
                    <Facebook className="w-5 h-5 text-gray-400 group-hover:text-[var(--glass-primary)] transition-colors duration-300" />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 glass-light rounded-full cursor-pointer group"
                  >
                    <Instagram className="w-5 h-5 text-gray-400 group-hover:text-[var(--glass-primary)] transition-colors duration-300" />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 glass-light rounded-full cursor-pointer group"
                  >
                    <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-[var(--glass-primary)] transition-colors duration-300" />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 glass-light rounded-full cursor-pointer group"
                  >
                    <Twitter className="w-5 h-5 text-gray-400 group-hover:text-[var(--glass-primary)] transition-colors duration-300" />
                  </motion.div>
                </div>

                {/* Newsletter */}
                <div className="glass-light p-6 rounded-2xl">
                  <h4 className="font-bold mb-3 text-white">📧 Newsletter</h4>
                  <p className="text-gray-300 text-sm mb-4">
                    Receba novidades, dicas e atualizações sobre gestão condominial
                  </p>
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      placeholder="seu@email.com"
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[var(--glass-primary)] transition-colors"
                    />
                    <Button className="bg-[var(--glass-primary)] hover:bg-[var(--glass-secondary)] text-white px-6">
                      Assinar
                    </Button>
                  </div>
                </div>
              </motion.div>
              
              {/* Platform Links */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <h4 className="font-bold mb-6 text-white text-lg">🏢 Plataforma</h4>
                <ul className="space-y-3">
                  <li>
                    <Link to="#funcionalidades" className="text-gray-300 hover:text-[var(--glass-primary)] transition-colors duration-300 flex items-center gap-2 group">
                      <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Funcionalidades
                    </Link>
                  </li>
                  <li>
                    <Link to="#depoimentos" className="text-gray-300 hover:text-[var(--glass-primary)] transition-colors duration-300 flex items-center gap-2 group">
                      <Star className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Depoimentos
                    </Link>
                  </li>
                  <li>
                    <Link to="#planos" className="text-gray-300 hover:text-[var(--glass-primary)] transition-colors duration-300 flex items-center gap-2 group">
                      <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Planos & Preços
                    </Link>
                  </li>
                  <li>
                    <Link to="/demo" className="text-gray-300 hover:text-[var(--glass-primary)] transition-colors duration-300 flex items-center gap-2 group">
                      <Smartphone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Demo Gratuita
                    </Link>
                  </li>
                </ul>
              </motion.div>
              
              {/* Solutions */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h4 className="font-bold mb-6 text-white text-lg">🎯 Soluções</h4>
                <ul className="space-y-3">
                  <li>
                    <Link to="/sindicos" className="text-gray-300 hover:text-[var(--glass-primary)] transition-colors duration-300 flex items-center gap-2 group">
                      <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Para Síndicos
                    </Link>
                  </li>
                  <li>
                    <Link to="/administradoras" className="text-gray-300 hover:text-[var(--glass-primary)] transition-colors duration-300 flex items-center gap-2 group">
                      <Building className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Para Administradoras
                    </Link>
                  </li>
                  <li>
                    <Link to="/moradores" className="text-gray-300 hover:text-[var(--glass-primary)] transition-colors duration-300 flex items-center gap-2 group">
                      <UserIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Para Moradores
                    </Link>
                  </li>
                  <li>
                    <Link to="/integracao" className="text-gray-300 hover:text-[var(--glass-primary)] transition-colors duration-300 flex items-center gap-2 group">
                      <Cloud className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Integrações
                    </Link>
                  </li>
                </ul>
              </motion.div>
              
              {/* Support & Contact */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h4 className="font-bold mb-6 text-white text-lg">🛠️ Suporte</h4>
                <ul className="space-y-3 mb-8">
                  <li>
                    <Link to="/ajuda" className="text-gray-300 hover:text-[var(--glass-primary)] transition-colors duration-300 flex items-center gap-2 group">
                      <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Central de Ajuda
                    </Link>
                  </li>
                  <li>
                    <Link to="/documentacao" className="text-gray-300 hover:text-[var(--glass-primary)] transition-colors duration-300 flex items-center gap-2 group">
                      <ClipboardList className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Documentação
                    </Link>
                  </li>
                  <li>
                    <Link to="/status" className="text-gray-300 hover:text-[var(--glass-primary)] transition-colors duration-300 flex items-center gap-2 group">
                      <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Status do Sistema
                    </Link>
                  </li>
                </ul>
                
                {/* Contact Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 group">
                    <div className="p-2 glass-light rounded-lg">
                      <Mail className="w-4 h-4 text-[var(--glass-primary)]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                      <span className="text-gray-300 group-hover:text-[var(--glass-primary)] transition-colors">contato@facilityfincas.com</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="p-2 glass-light rounded-lg">
                      <Phone className="w-4 h-4 text-[var(--glass-primary)]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">WhatsApp</p>
                      <span className="text-gray-300 group-hover:text-[var(--glass-primary)] transition-colors">+55 (11) 9999-9999</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="p-2 glass-light rounded-lg">
                      <MapPin className="w-4 h-4 text-[var(--glass-primary)]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Localização</p>
                      <span className="text-gray-300 group-hover:text-[var(--glass-primary)] transition-colors">São Paulo, SP - Brasil</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Bottom section */}
            <motion.div 
              className="border-t border-white/10 pt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <p className="text-gray-400 text-sm">
                    © 2025 <span className="text-[var(--glass-primary)] font-semibold">Facility Fincas</span>. Todos os direitos reservados.
                  </p>
                  <div className="flex gap-6 text-sm">
                    <Link to="/privacidade" className="text-gray-400 hover:text-[var(--glass-primary)] transition-colors">
                      Política de Privacidade
                    </Link>
                    <Link to="/termos" className="text-gray-400 hover:text-[var(--glass-primary)] transition-colors">
                      Termos de Uso
                    </Link>
                    <Link to="/cookies" className="text-gray-400 hover:text-[var(--glass-primary)] transition-colors">
                      Cookies
                    </Link>
                  </div>
                </div>
                
                {/* Trust badges */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 glass-light px-4 py-2 rounded-full">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-gray-300">SSL Seguro</span>
                  </div>
                  <div className="flex items-center gap-2 glass-light px-4 py-2 rounded-full">
                    <Cloud className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-gray-300">Cloud AWS</span>
                  </div>
                  <div className="flex items-center gap-2 glass-light px-4 py-2 rounded-full">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-gray-300">4.9/5 ⭐</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageContent;



