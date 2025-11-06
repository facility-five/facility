import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { TaskModal } from "@/components/admin/TaskModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  assigned_to: string | null;
  related_support_id: string | null;
  created_by: string;
  created_at: string;
};

const Tareas = () => {
  const [items, setItems] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [query, setQuery] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_tasks")
      .select("id, title, description, status, priority, due_date, assigned_to, related_support_id, created_by, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      showRadixError("Error al cargar tareas", error.message);
      setItems([]);
    } else {
      setItems((data || []) as Task[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      [i.title, i.description ?? ""].some((v) => v?.toLowerCase().includes(q))
    );
  }, [items, query]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("admin_tasks").update({ status }).eq("id", id);
    if (error) {
      showRadixError("Error al actualizar estado", error.message);
    } else {
      showRadixSuccess("Estado actualizado");
      fetchItems();
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">Tareas</h1>
          <p className="text-admin-foreground-muted">Gestión interna del trabajo</p>
        </div>
        <Button className="bg-purple-600" onClick={() => setIsNewOpen(true)}>+ Nueva Tarea</Button>
      </div>
      <div className="border border-admin-border rounded-lg p-4 bg-admin-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Lista de Tareas</h3>
          <Input
            placeholder="Buscar..."
            className="w-64 bg-admin-background border-admin-border"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-b-admin-border">
              <TableHead>Título</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Asignado a</TableHead>
              <TableHead>Fecha Límite</TableHead>
              <TableHead>Relacionado</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b-admin-border"><TableCell colSpan={8}><Skeleton className="h-10 w-full bg-admin-border" /></TableCell></TableRow>
              ))
            ) : filtered.map((task) => (
              <TableRow key={task.id} className="border-b-admin-border hover:bg-muted/50">
                <TableCell>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-admin-foreground-muted">{task.description ?? "-"}</p>
                </TableCell>
                <TableCell><Badge variant="outline">{task.priority}</Badge></TableCell>
                <TableCell>
                  <Select value={task.status} onValueChange={(v) => updateStatus(task.id, v)}>
                    <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="en_progreso">En Progreso</SelectItem>
                      <SelectItem value="bloqueada">Bloqueada</SelectItem>
                      <SelectItem value="finalizada">Finalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-xs">{task.assigned_to ?? '-'}</TableCell>
                <TableCell>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</TableCell>
                <TableCell className="text-xs">{task.related_support_id ?? '-'}</TableCell>
                <TableCell>{new Date(task.created_at).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TaskModal isOpen={isNewOpen} onClose={() => setIsNewOpen(false)} onSuccess={fetchItems} />
    </AdminLayout>
  );
};

export default Tareas;