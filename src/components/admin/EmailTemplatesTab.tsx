import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Eye, Pencil } from "lucide-react";

type EmailTemplate = {
  id: string;
  name: string;
  updated_at: string;
  status: 'active' | 'inactive';
};

export const EmailTemplatesTab = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("email_templates")
      .select("id, name, updated_at, status")
      .order("created_at", { ascending: true });

    if (error) {
      showError("Erro ao buscar modelos de e-mail.");
    } else {
      setTemplates(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('pt-PT', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  return (
    <Card className="bg-admin-card border-admin-border text-admin-foreground">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Plantillas de Correo Electrónico</CardTitle>
          <CardDescription className="text-admin-foreground-muted">
            Configure el contenido de los correos electrónicos transaccionales
          </CardDescription>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          + Nova Plantilla
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full bg-admin-border" />
            ))
          ) : (
            templates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-4 rounded-lg border border-admin-border bg-admin-background">
                <div className="flex items-center gap-4">
                  <Mail className="h-6 w-6 text-admin-foreground-muted" />
                  <div>
                    <p className="font-semibold">{template.name}</p>
                    <p className="text-sm text-admin-foreground-muted">
                      Última modificação: {formatDate(template.updated_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={template.status === 'active' ? 'default' : 'destructive'}>
                    {template.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Button variant="outline" size="sm" className="bg-transparent border-admin-border hover:bg-admin-border">
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button variant="outline" size="sm" className="bg-transparent border-admin-border hover:bg-admin-border">
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};