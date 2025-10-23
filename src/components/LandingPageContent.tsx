"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Github, MessageSquare, Zap, Code, Repeat, Users, DollarSign, Star } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle"; // Importar o ThemeToggle
import { DynamicLogo } from "./DynamicLogo"; // Reutilizar DynamicLogo

const LandingPageContent = () => {
  return (
    <div className="min-h-screen bg-landing-background text-landing-text">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-landing-background/90 backdrop-blur-sm border-b border-landing-border p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center gap-2">
            <DynamicLogo /> {/* Usar DynamicLogo aqui */}
          </Link>
          <div className="hidden md:flex space-x-4 text-sm font-medium text-landing-text-muted">
            <Link to="#" className="hover:text-landing-text">Produto</Link>
            <Link to="#" className="hover:text-landing-text">Casos de Uso</Link>
            <Link to="#" className="hover:text-landing-text">Docs</Link>
            <Link to="#" className="hover:text-landing-text">Comunidade</Link>
            <Link to="#" className="hover:text-landing-text">Empresa</Link>
            <Link to="#" className="hover:text-landing-text">Preços</Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="#" className="flex items-center gap-1 text-sm font-medium text-landing-text-muted hover:text-landing-text">
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span> <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> 148,939
          </Link>
          <Link to="/" className="text-sm font-medium text-landing-text-muted hover:text-landing-text">Entrar</Link>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
            <Link to="/criar-conta">Começar</Link>
          </Button>
          <ThemeToggle /> {/* Adicionar o ThemeToggle */}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 text-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1557682224-5b8590b9ec98?q=80&w=2070&auto=format&fit=crop)", backgroundSize: "cover", backgroundPosition: "center" }}></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900/70 to-indigo-900/70"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white">
            Automação de fluxo de trabalho <br className="hidden md:inline" />
            <span className="text-purple-400">flexível com IA</span> para equipes técnicas
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Construa com a precisão do código ou a simplicidade do arrastar e soltar. Hospede no local ou na nuvem.
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6 rounded-lg" asChild>
              <Link to="/criar-conta">Começar gratuitamente</Link>
            </Button>
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-purple-600 text-lg px-8 py-6 rounded-lg">
              Falar com vendas
            </Button>
          </div>
        </div>
        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 text-purple-500 opacity-10 animate-pulse" />
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-landing-background">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-landing-card border-landing-border text-landing-text">
            <CardHeader>
              <CardTitle className="text-purple-400">IT Ops</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-landing-text-muted">
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-400" /> Onboard novos funcionários</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-400" /> Gerenciar tickets de incidentes</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-landing-card border-landing-border text-landing-text">
            <CardHeader>
              <CardTitle className="text-purple-400">Sec Ops</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-landing-text-muted">
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-400" /> Enriquecer tickets de segurança</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-400" /> Automatizar resposta a incidentes</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-landing-card border-landing-border text-landing-text">
            <CardHeader>
              <CardTitle className="text-purple-400">Dev Ops</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-landing-text-muted">
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-400" /> Converter linguagem natural em chamadas de API</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-400" /> Automatizar testes</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-landing-card border-landing-border text-landing-text">
            <CardHeader>
              <CardTitle className="text-purple-400">Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-landing-text-muted">
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-400" /> Gerar insights de clientes a partir de avaliações</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-400" /> Automatizar follow-ups</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-16 px-4 bg-landing-background text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-landing-text">
          Conecte a IA aos seus dados e <br />
          mais de 500 integrações
        </h2>
        <div className="mt-12 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-6 max-w-6xl mx-auto">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="h-12 w-12 bg-landing-card border border-landing-border rounded-lg flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
              <Zap className="h-6 w-6 text-purple-400" /> {/* Placeholder icon */}
            </div>
          ))}
        </div>
        <Button className="mt-12 bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-4 rounded-lg">
          Explorar todas as integrações
        </Button>
      </section>

      {/* Build Multi-step Agents / Chat with your own data Section */}
      <section className="py-16 px-4 bg-landing-background">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-landing-card border-landing-border text-landing-text p-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Construa agentes multi-etapas</CardTitle>
              <CardDescription className="text-landing-text-muted">
                Crie sistemas agenticos em uma única tela. Integre qualquer LLM em seus fluxos de trabalho.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-landing-background rounded-lg flex items-center justify-center text-landing-text-muted">
                {/* Placeholder for diagram */}
                Diagrama de fluxo de trabalho
              </div>
              <Button className="mt-6 bg-purple-600 hover:bg-purple-700 text-white">
                Explorar IA
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-landing-card border-landing-border text-landing-text p-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Converse com seus próprios dados</CardTitle>
              <CardDescription className="text-landing-text-muted">
                Use Slack, Teams, SMS, voz ou nossa interface de chat incorporada para obter respostas precisas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-landing-background rounded-lg flex items-center justify-center text-landing-text-muted">
                {/* Placeholder for chat interface */}
                Interface de chat
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Code when you need it, UI when you don't Section */}
      <section className="py-16 px-4 bg-landing-background">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-landing-text">
              Código quando precisar, <br />
              UI quando não precisar
            </h2>
            <p className="text-lg text-landing-text-muted">
              Outras ferramentas limitam você a uma experiência de construção visual ou a código. Com a nossa plataforma, você obtém o melhor dos dois mundos.
            </p>
            <ul className="space-y-3 text-landing-text-muted">
              <li className="flex items-center"><Code className="h-5 w-5 mr-3 text-purple-400" /> Escreva JavaScript ou Python - você sempre pode voltar ao código</li>
              <li className="flex items-center"><Code className="h-5 w-5 mr-3 text-purple-400" /> Adicione bibliotecas npm ou Python para ainda mais poder</li>
            </ul>
          </div>
          <div className="h-96 bg-landing-card border border-landing-border rounded-lg flex items-center justify-center text-landing-text-muted">
            {/* Placeholder for code editor */}
            Editor de código
          </div>
        </div>
      </section>

      {/* Run. Tweak. Repeat. Section */}
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
              Execute. Ajuste. Repita.
            </h2>
            <p className="text-lg text-landing-text-muted">
              Os mesmos loops de feedback curtos que fazem você sorrir em seus scripts.
            </p>
            <ul className="space-y-3 text-landing-text-muted">
              <li className="flex items-center"><Check className="h-5 w-5 mr-3 text-green-400" /> Re-execute etapas únicas sem re-executar todo o fluxo de trabalho</li>
              <li className="flex items-center"><Check className="h-5 w-5 mr-3 text-green-400" /> Replay ou dados simulados para evitar esperar por sistemas externos</li>
              <li className="flex items-center"><Check className="h-5 w-5 mr-3 text-green-400" /> Depure rápido, com logs em linha com seu código</li>
              <li className="flex items-center"><Check className="h-5 w-5 mr-3 text-green-400" /> Use mais de 1700 modelos para iniciar seu projeto</li>
            </ul>
            <Button className="mt-6 bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-4 rounded-lg">
              Ver produto completo
            </Button>
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-16 px-4 bg-landing-background text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-landing-text">
          Estudos de Caso
        </h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-landing-card border-landing-border text-landing-text p-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Como a Delivery Hero economizou 200 horas por mês</CardTitle>
            </CardHeader>
            <CardContent className="text-landing-text-muted">
              "Tivemos melhorias drásticas na eficiência desde que começamos a usar a plataforma para gerenciamento de usuários. É incrivelmente poderosa, mas também simples de usar."
            </CardContent>
            <div className="flex items-center justify-center mt-4">
              <img src="https://github.com/shadcn.png" alt="User" className="h-10 w-10 rounded-full mr-3" />
              <div>
                <p className="font-semibold text-landing-text">Dennis Zahrt</p>
                <p className="text-sm text-landing-text-muted">Diretor de Global IT Service Delivery</p>
              </div>
            </div>
            <Button variant="outline" className="mt-6 bg-transparent border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white">
              Ler Estudo de Caso
            </Button>
          </Card>
          <Card className="bg-landing-card border-landing-border text-landing-text p-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Como a StepStone finaliza 2 semanas de trabalho em apenas 2 horas</CardTitle>
            </CardHeader>
            <CardContent className="text-landing-text-muted">
              "Aceleramos nossa integração de fontes de dados do marketplace em 25X. Levamos 2 horas no máximo para conectar APIs e transformar os dados de que precisamos."
            </CardContent>
            <div className="flex items-center justify-center mt-4">
              <img src="https://github.com/shadcn.png" alt="User" className="h-10 w-10 rounded-full mr-3" />
              <div>
                <p className="font-semibold text-landing-text">Luka Pilic</p>
                <p className="text-sm text-landing-text-muted">Líder Técnico de Marketplace</p>
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
          Não há nada que você não possa automatizar
        </h2>
        <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
          As palavras dos nossos clientes, não as nossas. Cético? Experimente e veja por si mesmo.
        </p>
        <Button className="mt-8 bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4 rounded-lg">
          Começar a construir
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-landing-background py-12 px-4 text-landing-text-muted text-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-landing-text text-lg font-bold">
              <DynamicLogo />
            </Link>
            <p>Automatize sem limites</p>
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
              <li><Link to="#" className="hover:text-landing-text">Carreiras</Link></li>
              <li><Link to="#" className="hover:text-landing-text">Contato</Link></li>
              <li><Link to="#" className="hover:text-landing-text">Imprensa</Link></li>
              <li><Link to="#" className="hover:text-landing-text">Legal</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-landing-text">Recursos</h4>
            <ul className="space-y-1">
              <li><Link to="#" className="hover:text-landing-text">Estudos de Caso</Link></li>
              <li><Link to="#" className="hover:text-landing-text">Modelos</Link></li>
              <li><Link to="#" className="hover:text-landing-text">Relatório de Agente de IA</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-landing-text">Guias Populares</h4>
            <ul className="space-y-1">
              <li><Link to="#" className="hover:text-landing-text">Bots do Telegram</Link></li>
              <li><Link to="#" className="hover:text-landing-text">Chatbot de código aberto</Link></li>
              <li><Link to="#" className="hover:text-landing-text">Plataforma de baixo código de código aberto</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-landing-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <Link to="#" className="hover:text-landing-text">Imprint</Link>
            <Link to="#" className="hover:text-landing-text">Segurança</Link>
            <Link to="#" className="hover:text-landing-text">Privacidade</Link>
            <Link to="#" className="hover:text-landing-text">Reportar uma vulnerabilidade</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Facility Fincas. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageContent;