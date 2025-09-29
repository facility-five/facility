"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeleteUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CONFIRMATION_TEXT = "ELIMINAR";

export const DeleteUnitModal = ({
  isOpen,
  onClose,
  onConfirm,
}: DeleteUnitModalProps) => {
  const [inputValue, setInputValue] = useState("");

  const isButtonDisabled = inputValue !== CONFIRMATION_TEXT;

  const handleConfirm = () => {
    if (!isButtonDisabled) {
      onConfirm();
      setInputValue("");
    }
  };

  const handleClose = () => {
    onClose();
    setInputValue("");
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="bg-admin-card border-admin-border text-admin-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar unidad</AlertDialogTitle>
          <AlertDialogDescription className="text-admin-foreground-muted">
            ¿Está seguro de que desea eliminar esta unidad?
            <br />
            Escriba "<strong>{CONFIRMATION_TEXT}</strong>" para confirmar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4">
          <Label htmlFor="confirm-delete">Escriba "{CONFIRMATION_TEXT}"</Label>
          <Input
            id="confirm-delete"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="bg-admin-background border-admin-border mt-2"
            autoComplete="off"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isButtonDisabled}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};