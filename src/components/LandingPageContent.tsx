"use client";

import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Github, MessageSquare, Zap, Code, Repeat, Users, DollarSign, Star, Home, CalendarCheck, Wrench, Megaphone, BarChart3, ShieldCheck, LogOut, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { DynamicLogo } from "./DynamicLogo";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { PlanCard } from "./PlanCard";
import { LoadingSpinner } from "./LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components

type DbPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  period: string; // 'monthly' | 'annual'
  status: string;
  features: string[] | null;
  stripe_price_id: string | null;
};

const LandingPageContent = () => {
  const { session, profile, signOut } = useAuth(); // Get session, profile, and signOut from AuthContext
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [plans, setPlans] = useState<DbPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const plansSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true);
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("status", "active")
        .order("price", { ascending: true });

      if (error) {
        showError("Erro ao carregar planos.");
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

  const scrollToPlans = () => {
    plansSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return `${first}${last}`.toUpperCase();
  };

  const handleGoToApp = () => {
    if (!profile) return;
    switch (profile.role) {
      case 'Administrador':
        navigate('/admin');
        break;
      case 'Administradora':
      case 'Síndico':
        navigate('/gestor-dashboard');
        break;
      case 'Morador':
        navigate('/morador-dashboard');
        break;
      default:
        navigate('/'); // Fallback
        break;
    }
  };

  const handleGoToProfile = () => {
    if (!profile) return;
    switch (profile.role) {
      case 'Administrador':
        navigate('/admin/minha-conta');
        break;
      case 'Administradora':
      case 'Síndico':
        navigate('/gestor/configuracoes'); // Assuming this is the manager's profile/settings page
        break;
      case 'Morador':
        navigate('/morador/perfil');
        break;
      default:
        navigate('/'); // Fallback
        break;
    }
  };

  const handleLogout = async () => {
    await signOut();
    showSuccess("Você saiu com sucesso!");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-landing-background text-landing-text">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-landing-background/90 backdrop-blur-sm border-b border-landing-border p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center gap-2">
            <DynamicLogo className="mb-0" imageClassName="h-8 w-auto max-h-8" />
          </Link>
          <div className="hidden md:flex space-x-4 text-sm font-medium text-landing-text-muted">
            <Link to="#" className="hover:text-landing-text">Produto</Link>
            <Link to="#" className="hover:text-landing-text">Funcionalidades</Link>
            <Link to="#" className="hover:text-landing-text">Casos de Sucesso</Link>
            <button onClick={scrollToPlans} className="hover:text-landing-text">Preços</button>
            <Link to="#" className="hover:text-landing-text">Contato</Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {session && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-landing-border p-2 rounded-lg transition-colors -m-2">
                  <Avatar>
                    <AvatarImage src={profile.avatar_url || undefined} alt={profile.first_name} />
                    <AvatarFallback>
                      {getInitials(profile.first_name, profile.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-semibold text-sm text-landing-text">{profile.first_name} {profile.last_name}</p>
                    <p className="text-xs text-landing-text-muted">{profile.email}</p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-landing-card border-landing-border text-landing-text" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs leading-none text-landing-text-muted">
                      Entrou como
                    </p>
                    <p className="text-sm font-medium leading-none text-purple-400">
                      {profile.first_name} {profile.last_name}
                    </p>
                    <p className="text-xs leading-none text-landing-text-muted">
                      {profile.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-landing-border" />
                <DropdownMenuItem className="focus:bg-landing-border focus:text-landing-text py-3" onClick={handleGoToApp}>
                  <Home className="mr-2 h-4 w-4" />
                  <span>Painel</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-landing-border focus:text-landing-text py-3" onClick={handleGoToProfile}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-landing-border" />
                <DropdownMenuItem className="focus:bg-destructive/10 focus:text-destructive py-3 text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-landing-text-muted hover:text-landing-text">Entrar</Link> {/* Alterado para /login */}
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={scrollToPlans}>
                Começar
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 text-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1557682224-5b8590b9ec98?q=80&w=2070&auto=format&fit-fit=crop)", backgroundSize: "cover", backgroundPosition: "center" }}></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900/70 to-indigo-900/70"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white">
            A Gestão de Condomínios <br className="hidden md:inline" />
            <span className="text-purple-400">Simplificada e Eficiente</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Uma plataforma completa para administradores, síndicos e moradores.
            Gerencie tudo em um só lugar, com transparência e agilidade.
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6 rounded-lg" asChild>
              <Link to="/criar-conta">Experimente Grátis</Link>
            </Button>
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-purple-600 text-lg px-8 py-6 rounded-lg">
              Solicitar Demonstração
            </Button>
          </div>
        </div>
        <Home className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 text-purple-500 opacity-10 animate-pulse" />
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-landing-background">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-landing-card border-landing-border text-landing-text">
            <CardHeader>
              <CardTitle className="text-purple-400">Gestão de Residentes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-landing-text-muted">
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-400" /> Cadastro e perfis detalhados</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-400" /> Controle de acesso e permissões</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-landing-card border-landing-border text-landing-text">
            <CardHeader>
              <CardTitle className="text-purple-400">Reservas de Áreas Comuns</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-landing-text-muted">
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-400" /> Agendamento online fácil</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-400" /> Calendário de disponibilidade</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-landing-card border-landing-border text-landing-text">
            <CardHeader>
              <CardTitle className="text-purple-400">Manutenção e Solicitações</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-landing-text-muted">
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-400" /> Abertura e acompanhamento de chamados</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-400" /> Histórico de manutenções</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-landing-card border-landing-border text-landing-text">
            <CardHeader>
              <CardTitle className="text-purple-400">Comunicação Eficaz</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-landing-text-muted">
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-400" /> Comunicados e avisos instantâneos</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-400" /> Fóruns de discussão</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-16 px-4 bg-landing-background text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-landing-text">
          Pronto para o futuro
        </h2>
        <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
          O Facility Fincas está preparado para futuras integrações com sistemas de pagamento, comunicação e muito mais, garantindo uma gestão sem interrupções.
        </p>
        <div className="mt-12 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-6 max-w-6xl mx-auto">
          {Array.from({ length: 10 }).map((_, i) => ( // Reduced number of placeholders
            <div key={i} className="h-12 w-12 bg-landing-card border border-landing-border rounded-lg flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
              <Zap className="h-6 w-6 text-purple-400" /> {/* Placeholder icon */}
            </div>
          ))}
        </div>
        <Button className="mt-12 bg-purple-600 hover:bg-purple-700 text-white">
          Saiba Mais
        </Button>
      </section>

      {/* Automation & Communication Section */}
      <section className="py-16 px-4 bg-landing-background">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-landing-card border-landing-border text-landing-text p-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Automatize Tarefas Repetitivas</CardTitle>
              <CardDescription className="text-landing-text-muted">
                Configure fluxos de trabalho para aprovação de reservas, envio de comunicados e gestão de manutenções.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-landing-background rounded-lg flex items-center justify-center text-landing-text-muted">
                <BarChart3 className="h-16 w-16 text-purple-400 opacity-50" />
              </div>
              <Button className="mt-6 bg-purple-600 hover:bg-purple-700 text-white">
                Descobrir Automação
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-landing-card border-landing-border text-landing-text p-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Comunicação Centralizada</CardTitle>
              <CardDescription className="text-landing-text-muted">
                Mantenha todos informados através de um único canal, com avisos, documentos e mensagens diretas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-landing-background rounded-lg flex items-center justify-center text-landing-text-muted">
                <MessageSquare className="h-16 w-16 text-purple-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Flexibility Section */}
      <section className="py-16 px-4 bg-landing-background">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-landing-text">
              Flexibilidade para <br />
              sua Gestão
            </h2>
            <p className="text-lg text-landing-text-muted">
              Nossa plataforma se adapta às necessidades do seu condomínio, oferecendo ferramentas personalizáveis e intuitivas.
            </p>
            <ul className="space-y-3 text-landing-text-muted">
              <li className="flex items-center"><Code className="h-5 w-5 mr-3 text-purple-400" /> Relatórios personalizáveis para uma visão clara</li>
              <li className="flex items-center"><Code className="h-5 w-5 mr-3 text-purple-400" /> Configurações adaptáveis para diferentes tipos de condomínios</li>
            </ul>
          </div>
          <div className="h-96 bg-landing-card border border-landing-border rounded-lg flex items-center justify-center text-landing-text-muted">
            <ShieldCheck className="h-24 w-24 text-purple-500 opacity-50" />
          </div>
        </div>
      </section>

      {/* Optimize Processes Section */}
      <section className="py-16 px-4 bg-landing-background">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="h-96 bg-landing-card border border-landing-border rounded-full flex items-center justify-center text-landing-text-muted relative">
            <Zap className="h-24 w-24 text-purple-500 opacity-50 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
                <Repeat className="h-48 w-48 text-purple-600 opacity-20" />
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-landing-text">
              Otimize seus Processos <br />
              e Ganhe Tempo
            </h2>
            <p className="text-lg text-landing-text-muted">
              Reduza a burocracia e foque no que realmente importa: a satisfação dos moradores.
            </p>
            <ul className="space-y-3 text-landing-text-muted">
              <li className="flex items-center"><Check className="h-5 w-5 mr-3 text-green-400" /> Gestão financeira integrada</li>
              <li className="flex items-center"><Check className="h-5 w-5 mr-3 text-green-400" /> Notificações automáticas para eventos importantes</li>
              <li className="flex items-center"><Check className="h-5 w-5 mr-3 text-green-400" /> Acesso rápido a informações e documentos</li>
            </ul>
            <Button className="mt-6 bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-4 rounded-lg">
              Ver Funcionalidades Completas
            </Button>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section ref={plansSectionRef} id="planos" className="py-16 px-4 bg-landing-background text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-landing-text">
          Escolha o plano ideal para o seu condomínio
        </h2>
        <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
          Oferecemos diferentes planos para satisfazer as necessidades
          específicas da sua gestão.
        </p>

        <div className="my-8">
          <div className="inline-flex bg-gray-800/50 rounded-full p-1">
            <Button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === "monthly"
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-transparent text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              Mensal
            </Button>
            <Button
              onClick={() => setBillingCycle("annual")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === "annual"
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-transparent text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              Anual
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 justify-center">
          {loadingPlans ? (
            <div className="flex justify-center items-center w-full h-48">
              <LoadingSpinner size="lg" className="border-primary shadow-lg shadow-primary/50" />
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-gray-300">Nenhum plano disponível.</div>
          ) : (
            filteredPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                name={plan.name}
                description={plan.description || ""}
                price={new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(plan.price)}
                period={`/${plan.period === "monthly" ? "mês" : "ano"}`}
                features={plan.features || []}
                buttonText="Ver Detalhes"
                onClick={() => window.location.href = `/planos`} // Link to the dedicated plans page
              />
            ))
          )}
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-16 px-4 bg-landing-background text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-landing-text">
          Casos de Sucesso
        </h2>
        <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
          Veja como o Facility Fincas transformou a gestão de condomínios para nossos clientes.
        </p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-landing-card border-landing-border text-landing-text p-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Condomínio Residencial Alpha</CardTitle>
            </CardHeader>
            <CardContent className="text-landing-text-muted">
              "A implementação do Facility Fincas reduziu em 30% o tempo gasto com burocracia e melhorou a comunicação com os moradores."
            </CardContent>
            <div className="flex items-center justify-center mt-4">
              <img src="https://github.com/shadcn.png" alt="User" className="h-10 w-10 rounded-full mr-3" />
              <div>
                <p className="font-semibold text-landing-text">Ana Paula Silva</p>
                <p className="text-sm text-landing-text-muted">Síndica Profissional</p>
              </div>
            </div>
            <Button variant="outline" className="mt-6 bg-transparent border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white">
              Ler Estudo de Caso
            </Button>
          </Card>
          <Card className="bg-landing-card border-landing-border text-landing-text p-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Administradora Soluções Imobiliárias</CardTitle>
            </CardHeader>
            <CardContent className="text-landing-text-muted">
              "Com o Facility Fincas, conseguimos gerenciar múltiplos condomínios de forma centralizada, otimizando recursos e aumentando a satisfação dos clientes."
            </CardContent>
            <div className="flex items-center justify-center mt-4">
              <img src="https://github.com/shadcn.png" alt="User" className="h-10 w-10 rounded-full mr-3" />
              <div>
                <p className="font-semibold text-landing-text">Carlos Eduardo</p>
                <p className="text-sm text-landing-text-muted">Diretor de Operações</p>
              </div>
            </div>
            <Button variant="outline" className="mt-6 bg-transparent border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white">
              Ler Estudo de Caso
            </Button>
          </Card>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-purple-800 to-indigo-800 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Transforme a gestão do seu condomínio hoje!
        </h2>
        <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
          Experimente o Facility Fincas e descubra um novo nível de eficiência e transparência.
        </p>
        <Button className="mt-8 bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4 rounded-lg" asChild>
          <Link to="/criar-conta">Começar Agora</Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-landing-background py-12 px-4 text-landing-text-muted text-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-landing-text text-lg font-bold">
              <DynamicLogo className="mb-0" imageClassName="h-8 w-auto max-h-8" />
            </Link>
            <p>Gestão de condomínios sem limites</p>
            <div className="flex space-x-4">
              <Link to="#" className="hover:text-landing-text"><Github className="h-5 w-5" /></Link>
              <Link to="#" className="hover:text-landing-text"><MessageSquare className="h-5 w-5" /></Link>
              <Link to="#" className="hover:text-landing-text"><Users className="h-5 w-5" /></Link>
              <Link to="#" className="hover:text-landing-text"><DollarSign className="h-5 w-5" /></Link>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-landing-text">Empresa</h4>
            <ul className="space-y-1">
              <li><Link to="#" className="hover:text-landing-text">Sobre Nós</Link></li>
              <li><Link to="#" className="hover:text-landing-text">Contato</Link></li>
              <li><Link to="#" className="hover:text-landing-text">Carreiras</Link></li>
              <li><Link to="#" className="hover:text-landing-text">Imprensa</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-landing-text">Recursos</h4>
            <ul className="space-y-1">
              <li><Link to="#" className="hover:text-landing-text">Blog</Link></li>
              <li><Link to="#" className="hover:text-landing-text">Central de Ajuda</Link></li>
              <li><Link to="#" className="hover:text-landing-text">Webinars</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-landing-text">Soluções</h4>
            <ul className="space-y-1">
              <li><Link to="#" className="hover:text-landing-text">Para Administradoras</Link></li>
              <li><Link to="#" className="hover:text-landing-text">Para Síndicos</Link></li>
              <li><Link to="#" className="hover:text-landing-text">Para Moradores</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-landing-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <Link to="#" className="hover:text-landing-text">Termos de Uso</Link>
            <Link to="#" className="hover:text-landing-text">Política de Privacidade</Link>
            <Link to="#" className="hover:text-landing-text">Cookies</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Facility Fincas. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageContent;