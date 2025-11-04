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
import { useTranslation } from "react-i18next";

interface DeleteCommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteCommunicationModal = ({
  isOpen,
  onClose,
  onConfirm,
}: DeleteCommunicationModalProps) => {
  const { t } = useTranslation();

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white border-gray-200">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("manager.communications.delete.title")}</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            {t("manager.communications.delete.description")}
            <br />
            {t("manager.communications.delete.warning")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            {t("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};