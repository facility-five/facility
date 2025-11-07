import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/admin/StatCard";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  Filter,
  Building,
  Home,
  MapPin,
  Pencil,
  Trash2,
  Eye,
  Download,
  Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateResidentModal } from "@/components/admin/CreateResidentModal";

export type Resident = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  document_number: string;
  status: 'active' | 'inactive' | 'pending';
  unit_id: string;
  unit_number: string;
  block_name: string;
  condominium_name: string;
  administrator_name: string;
  created_at: string;
  last_access: string;
};

export type Administrator = {
  id: string;
  name: string;
};

export type Condominium = {
  id: string;
  name: string;
  administrator_id: string;
};

export type Block = {
  id: string;
  name: string;
  condominium_id: string;
};

const ResidentsManagement = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  
  const [stats, setStats] = useState({ 
    total: 0, 
    active: 0, 
    inactive: 0, 
    pending: 0 
  });
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<string>("all");
  const [selectedCondo, setSelectedCondo] = useState<string>("all");
  const [selectedBlock, setSelectedBlock] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch data functions
  const fetchResidents = async () => {
    try {
      const { data, error } = await supabase
        .from('residents')
        .select(`
          *,
          units!inner(
            id,
            number,
            blocks!inner(
              id,
              name,
              condominiums!blocks_condominium_id_fkey!inner(
                id,
                name,
                administrators!condominiums_administrator_id_fkey!inner(
                  id,
                  name
                )
              )
            )
          )
        `);

      if (error) throw error;

      const formattedResidents: Resident[] = (data || []).map(resident => ({
        id: resident.id,
        first_name: resident.first_name || '',
        last_name: resident.last_name || '',
        email: resident.email || '',
        phone: resident.phone || '',
        document_number: resident.document_number || '',
        status: resident.status || 'pending',
        unit_id: resident.units.id,
        unit_number: resident.units.number,
        block_name: resident.units.blocks.name,
        condominium_name: resident.units.blocks.condominiums.name,
        administrator_name: resident.units.blocks.condominiums.administrators.name,
        created_at: resident.created_at,
        last_access: resident.last_access || ''
      }));

      setResidents(formattedResidents);
      setFilteredResidents(formattedResidents);
      
      // Calculate stats
      const total = formattedResidents.length;
      const active = formattedResidents.filter(r => r.status === 'active').length;
      const inactive = formattedResidents.filter(r => r.status === 'inactive').length;
      const pending = formattedResidents.filter(r => r.status === 'pending').length;
      
      setStats({ total, active, inactive, pending });
    } catch (error) {
      console.error('Error fetching residents:', error);
      showRadixError("Erro ao buscar moradores.");
    }
  };

  const fetchAdministrators = async () => {
    try {
      const { data, error } = await supabase
        .from('administrators')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setAdministrators(data || []);
    } catch (error) {
      console.error('Error fetching administrators:', error);
    }
  };

  const fetchCondominiums = async () => {
    try {
      const { data, error } = await supabase
        .from('condominiums')
        .select('id, name, administrator_id')
        .order('name');

      if (error) throw error;
      setCondominiums(data || []);
    } catch (error) {
      console.error('Error fetching condominiums:', error);
    }
  };

  const fetchBlocks = async () => {
    try {
      const { data, error } = await supabase
        .from('blocks')
        .select('id, name, condominium_id')
        .order('name');

      if (error) throw error;
      setBlocks(data || []);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchResidents(),
      fetchAdministrators(),
      fetchCondominiums(),
      fetchBlocks()
    ]);
    setLoading(false);
  };

  // Filter functions
  const applyFilters = () => {
    let filtered = residents;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(resident =>
        resident.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.document_number.includes(searchTerm) ||
        resident.unit_number.includes(searchTerm)
      );
    }

    // Administrator filter
    if (selectedAdmin !== "all") {
      filtered = filtered.filter(resident => 
        resident.administrator_name === administrators.find(a => a.id === selectedAdmin)?.name
      );
    }

    // Condominium filter
    if (selectedCondo !== "all") {
      filtered = filtered.filter(resident => 
        resident.condominium_name === condominiums.find(c => c.id === selectedCondo)?.name
      );
    }

    // Block filter
    if (selectedBlock !== "all") {
      filtered = filtered.filter(resident => 
        resident.block_name === blocks.find(b => b.id === selectedBlock)?.name
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(resident => resident.status === selectedStatus);
    }

    setFilteredResidents(filtered);
  };

  // Effects
  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    residents,
    searchTerm,
    selectedAdmin,
    selectedCondo,
    selectedBlock,
    selectedStatus,
  ]);

  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getFilteredCondominiums = () => {
    if (selectedAdmin === "all") return condominiums;
    return condominiums.filter(c => c.administrator_id === selectedAdmin);
  };

  const getFilteredBlocks = () => {
    if (selectedCondo === "all") return blocks;
    return blocks.filter(b => b.condominium_id === selectedCondo);
  };

  const renderSkeleton = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-admin-foreground">Gestão de Moradores</h1>
            <p className="text-admin-foreground-muted">
              Gerencie todos os moradores do sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Cadastrar Morador
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {loading ? (
          renderSkeleton()
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                title="Total de Moradores"
                value={stats.total.toString()}
                icon={Users}
              />
              <StatCard
                title="Ativos"
                value={stats.active.toString()}
                icon={UserCheck}
              />
              <StatCard
                title="Inativos"
                value={stats.inactive.toString()}
                icon={UserX}
              />
              <StatCard
                title="Pendentes"
                value={stats.pending.toString()}
                icon={Users}
              />
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
                <CardDescription>
                  Use os filtros abaixo para encontrar moradores específicos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  {/* Search */}
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar por nome, email, documento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Administrator Filter */}
                  <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                    <SelectTrigger>
                      <SelectValue placeholder="Administradora" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Administradoras</SelectItem>
                      {administrators.map((admin) => (
                        <SelectItem key={admin.id} value={admin.id}>
                          {admin.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Condominium Filter */}
                  <Select value={selectedCondo} onValueChange={setSelectedCondo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Condomínio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Condomínios</SelectItem>
                      {getFilteredCondominiums().map((condo) => (
                        <SelectItem key={condo.id} value={condo.id}>
                          {condo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Block Filter */}
                  <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                    <SelectTrigger>
                      <SelectValue placeholder="Bloco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Blocos</SelectItem>
                      {getFilteredBlocks().map((block) => (
                        <SelectItem key={block.id} value={block.id}>
                          {block.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Moradores ({filteredResidents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-purple-700 bg-purple-600 hover:bg-purple-600">
                        <TableHead className="text-white">Morador</TableHead>
                        <TableHead className="text-white">Documento</TableHead>
                        <TableHead className="text-white">Unidade</TableHead>
                        <TableHead className="text-white">Bloco</TableHead>
                        <TableHead className="text-white">Condomínio</TableHead>
                        <TableHead className="text-white">Administradora</TableHead>
                        <TableHead className="text-white">Status</TableHead>
                        <TableHead className="text-white">Último Acesso</TableHead>
                        <TableHead className="text-right text-white">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResidents.length > 0 ? (
                        filteredResidents.map((resident) => (
                          <TableRow key={resident.id} className="border-b-admin-border hover:bg-muted/50">
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {resident.first_name} {resident.last_name}
                                </p>
                                <p className="text-sm text-admin-foreground-muted">
                                  {resident.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{resident.document_number}</TableCell>
                            <TableCell>{resident.unit_number}</TableCell>
                            <TableCell>{resident.block_name}</TableCell>
                            <TableCell>{resident.condominium_name}</TableCell>
                            <TableCell>{resident.administrator_name}</TableCell>
                            <TableCell>{getStatusBadge(resident.status)}</TableCell>
                            <TableCell>{formatDate(resident.last_access)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow className="border-b-admin-border hover:bg-muted/50">
                          <TableCell colSpan={9} className="text-center text-admin-foreground-muted">
                            Nenhum morador encontrado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      <CreateResidentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchResidents(); // Recarrega a lista após cadastro
          showRadixSuccess("Morador cadastrado com sucesso!");
        }}
      />
    </AdminLayout>
  );
};

export default ResidentsManagement;
