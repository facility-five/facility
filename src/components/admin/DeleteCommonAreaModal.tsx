import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteCommonAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteCommonAreaModal = ({
  isOpen,
  onClose,
  onConfirm,
}: DeleteCommonAreaModalProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-admin-card border-admin-border text-admin-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Área Común</AlertDialogTitle>
          <AlertDialogDescription className="text-admin-foreground-muted">
            ¿Está seguro de que desea eliminar esta área común?
            <br />
            ¡Atención, esta acción es irreversible!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};