import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmailTemplate } from "./EmailTemplateFormModal";

interface ViewEmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: EmailTemplate | null;
}

export const ViewEmailTemplateModal = ({
  isOpen,
  onClose,
  template,
}: ViewEmailTemplateModalProps) => {
  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-admin-card border-admin-border text-admin-foreground">
        <DialogHeader>
          <DialogTitle>Visualizar Template</DialogTitle>
          <DialogDescription className="text-admin-foreground-muted">
            Preview do e-mail como será enviado aos usuários.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div>
                <Label>Asunto:</Label>
                <Input value={template.subject} readOnly className="bg-admin-background border-admin-border mt-1" />
            </div>
            <div>
                <Label>Conteúdo:</Label>
                <Textarea value={template.body || ''} readOnly className="bg-admin-background border-admin-border mt-1 min-h-[200px]" />
            </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};