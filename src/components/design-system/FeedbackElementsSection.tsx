import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { 
  toast,
  showCustomToast,
  showRadixSuccess,
  showRadixError,
  showRadixInfo,
  showRadixWarning,
  showRadixDefault,
  showRadixToast
} from '@/utils/toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Separator } from '@/components/ui/separator';
import { Terminal } from 'lucide-react';

export const FeedbackElementsSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleShowSuccessToast = () => {
    toast.success("Operação realizada com sucesso!");
  };

  const handleShowErrorToast = () => {
    toast.error("Ocorreu um erro ao processar a sua solicitação.");
  };

  const handleShowLoadingToast = () => {
    const toastId = toast.loading("Aguarde, estamos a processar...");
    setTimeout(() => {
      toast.dismiss(toastId);
      toast.success("Processo concluído!");
    }, 3000);
  };

  // Novos handlers para toasts com título e descrição
  const handleShowSuccessWithDescription = () => {
    toast.success("Conta criada com sucesso!", {
      description: "Bem-vindo ao sistema. Você já pode começar a usar todas as funcionalidades."
    });
  };

  const handleShowErrorWithDescription = () => {
    toast.error("Erro de autenticação", {
      description: "Não foi possível fazer login. Verifique suas credenciais e tente novamente."
    });
  };

  const handleShowInfoWithDescription = () => {
    showRadixInfo(
      "Nova atualização disponível",
      "Uma nova versão do sistema está disponível. Clique aqui para atualizar."
    );
  };

  const handleShowWarningWithDescription = () => {
    showRadixWarning(
      "Atenção: Dados não salvos",
      "Você tem alterações não salvas. Deseja continuar sem salvar?"
    );
  };

  const handleShowCustomToast = () => {
    showCustomToast(
      "Confirmar exclusão",
      "Esta ação não pode ser desfeita. Tem certeza que deseja excluir este item?",
      {
        type: 'warning',
        duration: 10000,
        action: {
          label: "Excluir",
          onClick: () => {
            toast.success("Item excluído", {
              description: "O item foi removido com sucesso."
            });
          }
        },
        cancel: {
          label: "Cancelar",
          onClick: () => {
            showRadixInfo("Operação cancelada", "Nenhum item foi excluído.");
          }
        }
      }
    );
  };

  // Novos handlers para toasts do Radix UI com fundo branco
  const handleShowRadixSuccess = () => {
    console.log('🧪 DEBUG: Chamando showRadixSuccess...');
    showRadixSuccess(
      "Sucesso com Radix UI",
      "Este é um toast de sucesso usando Radix UI com fundo branco."
    );
    console.log('✅ DEBUG: showRadixSuccess chamado com sucesso');
  };

  const handleShowRadixError = () => {
    console.log('🧪 DEBUG: Chamando showRadixError...');
    showRadixError(
      "Erro com Radix UI",
      "Este é um toast de erro usando Radix UI com fundo branco."
    );
    console.log('✅ DEBUG: showRadixError chamado com sucesso');
  };

  const handleShowRadixInfo = () => {
    console.log('🧪 DEBUG: Chamando showRadixInfo...');
    showRadixInfo(
      "Informação com Radix UI",
      "Este é um toast informativo usando Radix UI com fundo branco."
    );
    console.log('✅ DEBUG: showRadixInfo chamado com sucesso');
  };

  const handleShowRadixWarning = () => {
    console.log('🧪 DEBUG: Chamando showRadixWarning...');
    showRadixWarning(
      "Aviso com Radix UI",
      "Este é um toast de aviso usando Radix UI com fundo branco."
    );
    console.log('✅ DEBUG: showRadixWarning chamado com sucesso');
  };

  const handleShowRadixDefault = () => {
    console.log('🧪 DEBUG: Chamando showRadixDefault...');
    showRadixDefault(
      "Toast Padrão com Radix UI",
      "Este é um toast padrão usando Radix UI com fundo branco."
    );
    console.log('✅ DEBUG: showRadixDefault chamado com sucesso');
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

        <h3 className="text-xl font-semibold">Toasts Simples (Sonner)</h3>
        <div className="flex flex-wrap gap-4">
          <Button onClick={handleShowSuccessToast}>Mostrar Sucesso</Button>
          <Button variant="destructive" onClick={handleShowErrorToast}>Mostrar Erro</Button>
          <Button onClick={handleShowLoadingToast}>Mostrar Carregamento</Button>
        </div>

        <h3 className="text-xl font-semibold">Toasts com Título e Descrição (Sonner)</h3>
        <div className="flex flex-wrap gap-4">
          <Button onClick={handleShowSuccessWithDescription} variant="default">
            Sucesso com Descrição
          </Button>
          <Button onClick={handleShowErrorWithDescription} variant="destructive">
            Erro com Descrição
          </Button>
          <Button onClick={handleShowInfoWithDescription} variant="secondary">
            Info com Descrição
          </Button>
          <Button onClick={handleShowWarningWithDescription} variant="outline">
            Aviso com Descrição
          </Button>
        </div>

        <h3 className="text-xl font-semibold">Toast Customizado com Ações (Sonner)</h3>
        <div className="flex flex-wrap gap-4">
          <Button onClick={handleShowCustomToast} variant="outline">
            Toast com Botões de Ação
          </Button>
        </div>

        <h3 className="text-xl font-semibold">Toasts Radix UI (Fundo Branco)</h3>
        <div className="flex flex-wrap gap-4">
          <Button onClick={handleShowRadixSuccess} className="bg-green-600 hover:bg-green-700">
            Sucesso Radix UI
          </Button>
          <Button onClick={handleShowRadixError} variant="destructive">
            Erro Radix UI
          </Button>
          <Button onClick={handleShowRadixInfo} className="bg-blue-600 hover:bg-blue-700">
            Info Radix UI
          </Button>
          <Button onClick={handleShowRadixWarning} className="bg-yellow-600 hover:bg-yellow-700">
            Aviso Radix UI
          </Button>
          <Button onClick={handleShowRadixDefault} variant="outline">
            Padrão Radix UI
          </Button>
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