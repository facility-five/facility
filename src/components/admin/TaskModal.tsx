import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showRadixError, showRadixSuccess } from "@/utils/toast";

type SystemUser = { id: string; first_name: string | null; last_name: string | null; email: string | null; };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  relatedSupportId?: string | null;
};

export const TaskModal = ({ isOpen, onClose, onSuccess, relatedSupportId }: Props) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pendiente");
  const [priority, setPriority] = useState("media");
  const [dueDate, setDueDate] = useState<string>("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.rpc("get_system_users");
      if (error) {
        console.error("Error fetching system users", error);
        return;
      }
      setUsers((data || []) as SystemUser[]);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (user?.id) {
      setAssignedTo((prev) => prev || user.id);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user?.id) {
      showRadixError("Sessão expirada");
      return;
    }
    if (!title.trim()) {
      showRadixError("El título es obligatorio");
      return;
    }
    setLoading(true);
    const { data: inserted, error } = await supabase.from("admin_tasks").insert([
      {
        title,
        description: description || null,
        status,
        priority,
        due_date: dueDate || null,
        assigned_to: assignedTo || null,
        related_support_id: relatedSupportId || null,
        created_by: user.id,
      },
    ]).select("id").limit(1);
    setLoading(false);
    if (error) {
      showRadixError("Error al crear tarea", error.message);
    } else {
      // Fallback: criar notificações client-side para garantir visibilidade imediata
      try {
        const taskId = inserted?.[0]?.id;
        const inserts: any[] = [];
        const isSelfAssigned = assignedTo && assignedTo === user.id;
        inserts.push({
          user_id: user.id,
          title: isSelfAssigned ? "Nueva tarea asignada" : "Tarea creada",
          message: isSelfAssigned
            ? `La tarea ${title} fue creada y asignada a ti`
            : `Se creó la tarea: ${title}`,
          entity_type: "admin_task",
          entity_id: taskId ?? null,
          type: isSelfAssigned ? "task.assigned" : "task.created",
          is_read: false,
        });
        if (assignedTo) {
          if (!isSelfAssigned) {
            inserts.push({
              user_id: assignedTo,
              title: "Nueva tarea asignada",
              message: `Has recibido la tarea: ${title}`,
              entity_type: "admin_task",
              entity_id: taskId ?? null,
              type: "task.assigned",
              is_read: false,
            });
          }
        }
        if (inserts.length > 0) {
          await supabase.from("notifications").insert(inserts);
        }
      } catch (e) {
        console.warn("Falha ao inserir notificação de tarefa (fallback)", e);
      }
      showRadixSuccess("Tarea creada");
      onSuccess();
      onClose();
      setTitle("");
      setDescription("");
      setStatus("pendiente");
      setPriority("media");
      setDueDate("");
      setAssignedTo("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-admin-card border-admin-border">
        <DialogHeader>
          <DialogTitle>Nueva Tarea</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej.: Revisar pago pendiente" />
          </div>
          <div>
            <Label>Descripción</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalles de la tarea..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Estado</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_progreso">En Progreso</SelectItem>
                  <SelectItem value="bloqueada">Bloqueada</SelectItem>
                  <SelectItem value="finalizada">Finalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridad</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue placeholder="Seleccionar prioridad" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Fecha Límite</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div>
              <Label>Asignar a</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger><SelectValue placeholder="Seleccionar usuario" /></SelectTrigger>
                <SelectContent>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {`${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || u.email || u.id}
                    </SelectItem>
                  ))}
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
