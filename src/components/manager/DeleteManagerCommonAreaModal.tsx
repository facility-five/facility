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

interface DeleteManagerCommonAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  areaName?: string;
}

export const DeleteManagerCommonAreaModal = ({
  isOpen,
  onClose,
  onConfirm,
  areaName,
}: DeleteManagerCommonAreaModalProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Área Comum</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a área comum{" "}
            <strong>"{areaName}"</strong>?
            <br />
            <br />
            Esta ação não pode ser desfeita. A área comum será marcada como excluída
            e não aparecerá mais nas listagens, mas os dados históricos serão preservados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};