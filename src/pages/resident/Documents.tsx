import { useState, useEffect } from "react";
import { ResidentLayout } from "@/components/resident/ResidentLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { showRadixSuccess } from "@/utils/toast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { 
  FileText, 
  Download, 
  Search, 
  Calendar, 
  Eye, 
  Filter,
  FileCheck,
  AlertCircle,
  Clock,
  Building2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Document = {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_size: number;
  document_type: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  condominium_name: string;
};

const Documents = () => {
  const { user } = useAuth();
  const { showError } = useErrorHandler();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      // Primeiro, buscar o condomínio do morador
      const { data: residentData, error: residentError } = await supabase
        .from('residents')
        .select('condo_id, condominiums(id, name)')
        .eq('profile_id', user?.id)
        .single();

      if (residentError) throw residentError;

      const condominiumId = residentData.condo_id;

      // Buscar documentos do condomínio
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          condominiums!inner(
            name
          )
        `)
        .eq('condominium_id', condominiumId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const documentsData: Document[] = data.map(doc => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        file_url: doc.file_url,
        file_name: doc.file_name,
        file_size: doc.file_size,
        document_type: doc.document_type,
        is_public: doc.is_public,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        condominium_name: doc.condominiums?.name || "",
      }));

      setDocuments(documentsData);
    } catch (error: any) {
      showError("Erro ao carregar documentos: " + error.message, "DOCUMENTS_LOAD_ERROR");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (document: Document) => {
    setDownloading(document.id);
    try {
      // Simular download - em produção, isso seria um link direto ou uma API
      const response = await fetch(document.file_url);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showRadixSuccess("Download iniciado com sucesso!");
    } catch (error: any) {
      showError("Erro ao fazer download: " + error.message, "DOCUMENTS_DOWNLOAD_ERROR");
    } finally {
      setDownloading(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'ata': 'Ata de Reunião',
      'regulamento': 'Regulamento',
      'comunicado': 'Comunicado',
      'financeiro': 'Documento Financeiro',
      'juridico': 'Documento Jurídico',
      'outros': 'Outros'
    };
    return types[type] || type;
  };

  const getDocumentTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'ata': 'bg-blue-100 text-blue-800',
      'regulamento': 'bg-purple-100 text-purple-800',
      'comunicado': 'bg-green-100 text-green-800',
      'financeiro': 'bg-yellow-100 text-yellow-800',
      'juridico': 'bg-red-100 text-red-800',
      'outros': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || doc.document_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const documentTypes = [...new Set(documents.map(doc => doc.document_type))];

  if (loading) {
    return (
      <ResidentLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-48" />
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </ResidentLayout>
    );
  }

  return (
    <ResidentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Documentos</h1>
          <p className="text-muted-foreground">
            Acesse atas de reunião, regulamentos e outros documentos importantes.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {documentTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {getDocumentTypeLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Documentos */}
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || typeFilter !== "all" 
                  ? "Tente ajustar os filtros de busca."
                  : "Não há documentos disponíveis no momento."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <h3 className="font-semibold text-lg truncate">{document.title}</h3>
                        <Badge className={getDocumentTypeColor(document.document_type)}>
                          {getDocumentTypeLabel(document.document_type)}
                        </Badge>
                      </div>
                      
                      {document.description && (
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {document.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{document.condominium_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(document.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileCheck className="h-4 w-4" />
                          <span>{formatFileSize(document.file_size)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(document)}
                        disabled={downloading === document.id}
                      >
                        {downloading === document.id ? (
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        {downloading === document.id ? "Baixando..." : "Download"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Informações adicionais */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Informações importantes:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Os documentos são atualizados regularmente pela administração</li>
                  <li>• Para solicitar documentos específicos, entre em contato com a administração</li>
                  <li>• Mantenha seus documentos pessoais sempre atualizados</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResidentLayout>
  );
};

export default Documents;
