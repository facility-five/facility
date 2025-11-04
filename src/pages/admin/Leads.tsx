import { useEffect, useState, useMemo, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  UserCheck, 
  Users as UsersIcon, 
  TrendingUp, 
  Phone, 
  Mail, 
  Calendar,
  Search,
  Filter,
  Download,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  status: 'novo' | 'contatado' | 'qualificado' | 'convertido' | 'perdido';
  created_at: string;
  last_contact?: string;
  notes?: string;
};

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({ 
    total: 0, 
    novos: 0, 
    qualificados: 0, 
    convertidos: 0 
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  // Mock data para demonstração - em produção, isso viria do Supabase
  const mockLeads: Lead[] = useMemo(() => ([
    {
      id: "1",
      name: "João Silva",
      email: "joao.silva@email.com",
      phone: "+55 11 99999-9999",
      company: "Condomínio Jardim das Flores",
      source: "Website",
      status: "novo",
      created_at: new Date().toISOString(),
      notes: "Interessado em plano premium"
    },
    {
      id: "2",
      name: "Maria Santos",
      email: "maria.santos@email.com",
      phone: "+55 11 88888-8888",
      company: "Residencial Vista Alegre",
      source: "Indicação",
      status: "contatado",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      last_contact: new Date().toISOString(),
      notes: "Reunião agendada para próxima semana"
    },
    {
      id: "3",
      name: "Carlos Oliveira",
      email: "carlos.oliveira@email.com",
      phone: "+55 11 77777-7777",
      company: "Edifício Central Park",
      source: "Google Ads",
      status: "qualificado",
      created_at: new Date(Date.now() - 172800000).toISOString(),
      last_contact: new Date(Date.now() - 86400000).toISOString(),
      notes: "Demonstração realizada, aguardando decisão"
    },
    {
      id: "4",
      name: "Ana Costa",
      email: "ana.costa@email.com",
      phone: "+55 11 66666-6666",
      company: "Condomínio Bela Vista",
      source: "Facebook",
      status: "convertido",
      created_at: new Date(Date.now() - 259200000).toISOString(),
      last_contact: new Date(Date.now() - 172800000).toISOString(),
      notes: "Cliente convertido - plano básico contratado"
    }
  ]), []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      // Em produção, aqui seria uma consulta real ao Supabase
      // const { data, error } = await supabase.from('leads').select('*');
      
      // Por enquanto, usando dados mock
      setLeads(mockLeads);
      setFilteredLeads(mockLeads);
      
      // Calculando estatísticas
      const total = mockLeads.length;
      const novos = mockLeads.filter(l => l.status === 'novo').length;
      const qualificados = mockLeads.filter(l => l.status === 'qualificado').length;
      const convertidos = mockLeads.filter(l => l.status === 'convertido').length;
      
      setStats({ total, novos, qualificados, convertidos });
    } catch (error) {
      showRadixError("Erro ao buscar leads.");
    } finally {
      setLoading(false);
    }
  }, [mockLeads]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    let filtered = leads;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (statusFilter !== "todos") {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      novo: { label: "Novo", variant: "default" as const },
      contatado: { label: "Contatado", variant: "secondary" as const },
      qualificado: { label: "Qualificado", variant: "outline" as const },
      convertido: { label: "Convertido", variant: "default" as const },
      perdido: { label: "Perdido", variant: "destructive" as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.novo;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-admin-foreground">Clientes Potenciais</h1>
          <p className="text-admin-foreground-muted">Gerencie seus leads e oportunidades de negócio</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <UserCheck className="h-4 w-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total de Leads"
          value={stats.total.toString()}
          icon={UsersIcon}
          loading={loading}
        />
        <StatCard
          title="Novos Leads"
          value={stats.novos.toString()}
          icon={UserCheck}
          loading={loading}
        />
        <StatCard
          title="Qualificados"
          value={stats.qualificados.toString()}
          icon={TrendingUp}
          loading={loading}
        />
        <StatCard
          title="Convertidos"
          value={stats.convertidos.toString()}
          icon={UserCheck}
          loading={loading}
        />
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos os Status</option>
                <option value="novo">Novo</option>
                <option value="contatado">Contatado</option>
                <option value="qualificado">Qualificado</option>
                <option value="convertido">Convertido</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-purple-700 bg-purple-600 hover:bg-purple-600">
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Telefone</TableHead>
                  <TableHead className="text-white">Empresa</TableHead>
                  <TableHead className="text-white">Origem</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Criado em</TableHead>
                  <TableHead className="text-white">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <UserCheck className="h-12 w-12 text-gray-400" />
                        <p className="text-gray-500">
                          {searchTerm || statusFilter !== "todos" 
                            ? "Nenhum lead encontrado com os filtros aplicados" 
                            : "Nenhum lead encontrado"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="border-b-admin-border hover:bg-muted/50">
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {lead.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {lead.phone}
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{lead.company || 'N/A'}</TableCell>
                      <TableCell>{lead.source}</TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(lead.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default Leads;
