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
import { AlertTriangle } from "lucide-react";

interface DeleteManagerRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  requestTitle?: string;
}

export const DeleteManagerRequestModal = ({
  isOpen,
  onClose,
  onConfirm,
  requestTitle,
}: DeleteManagerRequestModalProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle>Eliminar Solicitud</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <div className="py-4">
          <AlertDialogDescription className="text-base">
            ¿Estás seguro de que quieres eliminar la solicitud{" "}
            <strong className="text-gray-900">"{requestTitle}"</strong>?
            <br />
            <br />
            <span className="text-red-600 font-medium">
              • Se perderán todos los comentarios y seguimientos
            </span>
            <br />
            <span className="text-red-600 font-medium">
              • El residente no podrá consultar el historial
            </span>
            <br />
            <span className="text-red-600 font-medium">
              • Esta acción es irreversible
            </span>
          </AlertDialogDescription>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Sí, Eliminar Solicitud
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};