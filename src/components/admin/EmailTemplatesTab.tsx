import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Eye, Pencil, Trash2 } from "lucide-react";
import { EmailTemplateFormModal, EmailTemplate } from "./EmailTemplateFormModal";
import { ViewEmailTemplateModal } from "./ViewEmailTemplateModal";
import { DeleteEmailTemplateModal } from "./DeleteEmailTemplateModal";

export const EmailTemplatesTab = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      showRadixError("Erro ao buscar modelos de e-mail.");
    } else {
      setTemplates(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleNew = () => {
    setSelectedTemplate(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsFormModalOpen(true);
  };

  const handleView = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;
    const { error } = await supabase.from("email_templates").delete().eq("id", selectedTemplate.id);

    if (error) {
      showRadixError(error.message);
    } else {
      showRadixSuccess("Plantilla eliminada com sucesso!");
      fetchTemplates();
    }
    setIsDeleteModalOpen(false);
    setSelectedTemplate(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('pt-PT', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  return (
    <>
      <Card className="bg-admin-card border-admin-border text-admin-foreground">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Plantillas de Correo Electrónico</CardTitle>
            <CardDescription className="text-admin-foreground-muted">
              Configure el contenido de los correos electrónicos transaccionales
            </CardDescription>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleNew}>
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
                  <div className="flex items-center gap-2">
                    <Badge variant={template.status === 'active' ? 'default' : 'destructive'}>
                      {template.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Button variant="outline" size="icon" className="bg-transparent border-admin-border hover:bg-admin-border" onClick={() => handleView(template)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="bg-transparent border-admin-border hover:bg-admin-border" onClick={() => handleEdit(template)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="bg-transparent border-admin-border hover:bg-admin-border hover:text-red-500" onClick={() => openDeleteModal(template)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <EmailTemplateFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchTemplates}
        template={selectedTemplate}
      />

      <ViewEmailTemplateModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        template={selectedTemplate}
      />

      <DeleteEmailTemplateModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};
