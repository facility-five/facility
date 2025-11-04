import { useEffect, useMemo, useState } from "react";
import { ResidentLayout } from "@/components/resident/ResidentLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Filter,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showRadixSuccess } from "@/utils/toast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Skeleton } from "@/components/ui/skeleton";
import { ResidentStatCard } from "@/components/resident/ResidentStatCard";
import { Badge } from "@/components/ui/badge";

type Request = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location?: string;
  created_at: string;
  updated_at: string;
  resolution_notes?: string;
  rating?: number;
};

const categoryLabels = {
  manutencao: "Manutenção",
  limpeza: "Limpeza",
  seguranca: "Segurança",
  infraestrutura: "Infraestrutura",
  outros: "Outros"
};

const priorityLabels = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente"
};

const statusLabels = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluida: "Concluída",
  cancelada: "Cancelada"
};

const Requests = () => {
  const { user } = useAuth();
  const { showError } = useErrorHandler();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  
  // Form state for new request
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    category: "",
    priority: "media",
    location: ""
  });

  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("resident_requests")
      .select("*")
      .eq("resident_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      showError("Erro ao buscar solicitações: " + error.message, "REQUESTS_FETCH_ERROR");
      console.error("Error fetching requests:", error);
    } else {
      setRequests(data as Request[] || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pendente').length;
    const inProgress = requests.filter(r => r.status === 'em_andamento').length;
    const completed = requests.filter(r => r.status === 'concluida').length;
    return { total, pending, inProgress, completed };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           r.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [requests, searchQuery, statusFilter, categoryFilter]);

  const handleCreateRequest = async () => {
    if (!user || !newRequest.title || !newRequest.description || !newRequest.category) {
      showError("Por favor, preencha todos os campos obrigatórios.", "REQUESTS_VALIDATION_ERROR");
      return;
    }

    const { error } = await supabase
      .from("resident_requests")
      .insert([{
        ...newRequest,
        resident_id: user.id,
        condominium_id: "00000000-0000-0000-0000-000000000000" // Placeholder - should be actual condominium_id
      }]);

    if (error) {
      showError("Erro ao criar solicitação: " + error.message, "REQUESTS_CREATE_ERROR");
      console.error("Error creating request:", error);
    } else {
      showRadixSuccess("Solicitação criada com sucesso!");
      setIsNewModalOpen(false);
      setNewRequest({
        title: "",
        description: "",
        category: "",
        priority: "media",
        location: ""
      });
      fetchRequests();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'concluida':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'cancelada':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'baixa':
        return 'bg-gray-100 text-gray-800';
      case 'media':
        return 'bg-blue-100 text-blue-800';
      case 'alta':
        return 'bg-orange-100 text-orange-800';
      case 'urgente':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const openViewModal = (request: Request) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  return (
    <ResidentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Solicitações</h1>
          <p className="text-muted-foreground">
            Abra e acompanhe suas solicitações para a administração.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ResidentStatCard
            title="Total"
            value={stats.total}
            icon={Filter}
            description="Solicitações criadas"
          />
          <ResidentStatCard
            title="Pendentes"
            value={stats.pending}
            icon={Clock}
            description="Aguardando atendimento"
          />
          <ResidentStatCard
            title="Em Andamento"
            value={stats.inProgress}
            icon={AlertTriangle}
            description="Sendo processadas"
          />
          <ResidentStatCard
            title="Concluídas"
            value={stats.completed}
            icon={CheckCircle}
            description="Finalizadas"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <Input
              placeholder="Buscar solicitações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md:w-64"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="md:w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
                <SelectItem value="limpeza">Limpeza</SelectItem>
                <SelectItem value="seguranca">Segurança</SelectItem>
                <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsNewModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Solicitação
          </Button>
        </div>

        {/* Requests Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {categoryLabels[request.category as keyof typeof categoryLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityBadge(request.priority)}>
                        {priorityLabels[request.priority as keyof typeof priorityLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(request.status)}>
                        {statusLabels[request.status as keyof typeof statusLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(request.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openViewModal(request)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhuma solicitação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* New Request Modal */}
        <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Nova Solicitação</DialogTitle>
              <DialogDescription>
                Preencha os dados da sua solicitação para a administração.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  placeholder="Ex: Vazamento no banheiro"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={newRequest.category}
                  onValueChange={(value) => setNewRequest({ ...newRequest, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="limpeza">Limpeza</SelectItem>
                    <SelectItem value="seguranca">Segurança</SelectItem>
                    <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={newRequest.priority}
                  onValueChange={(value) => setNewRequest({ ...newRequest, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={newRequest.location}
                  onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })}
                  placeholder="Ex: Apartamento 101, Área da piscina"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Descreva detalhadamente o problema ou solicitação..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateRequest}>
                Criar Solicitação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Request Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Detalhes da Solicitação</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Título</Label>
                  <p className="text-sm">{selectedRequest.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Categoria</Label>
                    <Badge variant="outline" className="w-fit">
                      {categoryLabels[selectedRequest.category as keyof typeof categoryLabels]}
                    </Badge>
                  </div>
                  <div className="grid gap-2">
                    <Label>Prioridade</Label>
                    <Badge className={`${getPriorityBadge(selectedRequest.priority)} w-fit`}>
                      {priorityLabels[selectedRequest.priority as keyof typeof priorityLabels]}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Badge className={`${getStatusBadge(selectedRequest.status)} w-fit`}>
                      {statusLabels[selectedRequest.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                  <div className="grid gap-2">
                    <Label>Data de Criação</Label>
                    <p className="text-sm">{formatDate(selectedRequest.created_at)}</p>
                  </div>
                </div>
                {selectedRequest.location && (
                  <div className="grid gap-2">
                    <Label>Local</Label>
                    <p className="text-sm">{selectedRequest.location}</p>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label>Descrição</Label>
                  <p className="text-sm whitespace-pre-wrap">{selectedRequest.description}</p>
                </div>
                {selectedRequest.resolution_notes && (
                  <div className="grid gap-2">
                    <Label>Observações da Resolução</Label>
                    <p className="text-sm whitespace-pre-wrap">{selectedRequest.resolution_notes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ResidentLayout>
  );
};

export default Requests;