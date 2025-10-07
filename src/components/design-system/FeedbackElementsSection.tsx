import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Separator } from '@/components/ui/separator';
import { Terminal } from 'lucide-react';

export const FeedbackElementsSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleShowSuccessToast = () => {
    showSuccess("Operação realizada com sucesso!");
  };

  const handleShowErrorToast = () => {
    showError("Ocorreu um erro ao processar a sua solicitação.");
  };

  const handleShowLoadingToast = () => {
    const toastId = showLoading("Aguarde, estamos a processar...");
    setTimeout(() => {
      dismissToast(toastId);
      showSuccess("Processo concluído!");
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-admin-foreground">Elementos de Feedback</h2>
      <Separator className="bg-admin-border" />

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Alertas</h3>
        <Alert className="bg-admin-background border-admin-border text-admin-foreground">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            Você pode adicionar seus próprios componentes e utilitários aqui.
          </AlertDescription>
        </Alert>

        <h3 className="text-xl font-semibold">Diálogos</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Abrir Diálogo</Button>
          </DialogTrigger>
          <DialogContent className="bg-admin-card border-admin-border text-admin-foreground">
            <DialogHeader>
              <DialogTitle>Você tem certeza?</DialogTitle>
              <DialogDescription className="text-admin-foreground-muted">
                Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta
                e removerá seus dados de nossos servidores.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={() => setIsDialogOpen(false)}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <h3 className="text-xl font-semibold">Toasts (Sonner)</h3>
        <div className="flex flex-wrap gap-4">
          <Button onClick={handleShowSuccessToast}>Mostrar Sucesso</Button>
          <Button variant="destructive" onClick={handleShowErrorToast}>Mostrar Erro</Button>
          <Button onClick={handleShowLoadingToast}>Mostrar Carregamento</Button>
        </div>

        <h3 className="text-xl font-semibold">Spinner de Carregamento</h3>
        <div className="flex items-center gap-4">
          <LoadingSpinner size="sm" />
          <LoadingSpinner size="md" />
          <LoadingSpinner size="lg" />
          <LoadingSpinner size="lg" className="text-purple-600" />
        </div>
      </div>
    </div>
  );
};