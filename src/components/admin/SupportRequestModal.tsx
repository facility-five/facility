import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showRadixError, showRadixSuccess } from "@/utils/toast";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export const SupportRequestModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("media");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user?.id) {
      showRadixError("Sessão expirada");
      return;
    }
    if (!title.trim() || !description.trim()) {
      showRadixError("Título y descripción son obligatorios");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("support_requests").insert([
      {
        title,
        description,
        category: category || null,
        priority,
        requester_user_id: user.id,
      },
    ]);
    setLoading(false);
    if (error) {
      showRadixError("Error al crear solicitud", error.message);
    } else {
      showRadixSuccess("Solicitud creada");
      onSuccess();
      onClose();
      setTitle("");
      setDescription("");
      setCategory("");
      setPriority("media");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-admin-card border-admin-border">
        <DialogHeader>
          <DialogTitle>Nueva Solicitud</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej.: Problema de acceso" />
          </div>
          <div>
            <Label>Descripción</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe el problema..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Categoría</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ej.: Pagos, Acceso" />
            </div>
            <div>
              <Label>Prioridad</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button className="bg-purple-600" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creando..." : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};