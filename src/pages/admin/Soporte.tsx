import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { SupportRequestModal } from "@/components/admin/SupportRequestModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type SupportRequest = {
  id: string;
  title: string;
  description: string;
  category: string | null;
  priority: string;
  status: string;
  requester_user_id: string;
  assigned_to: string | null;
  created_at: string;
};

const Soporte = () => {
  const [items, setItems] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [query, setQuery] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("support_requests")
      .select("id, title, description, category, priority, status, requester_user_id, assigned_to, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      showRadixError("Error al cargar solicitudes", error.message);
      setItems([]);
    } else {
      setItems((data || []) as SupportRequest[]);
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
      [i.title, i.description, i.category ?? ""].some((v) => v?.toLowerCase().includes(q))
    );
  }, [items, query]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("support_requests").update({ status }).eq("id", id);
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
          <h1 className="text-3xl font-bold">Soporte</h1>
          <p className="text-admin-foreground-muted">Solicitudes de clientes</p>
        </div>
        <Button className="bg-purple-600" onClick={() => setIsNewOpen(true)}>+ Nueva Solicitud</Button>
      </div>
      <div className="border border-admin-border rounded-lg p-4 bg-admin-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Lista de Solicitudes</h3>
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
              <TableHead>Solicitante</TableHead>
              <TableHead>Asignado a</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b-admin-border"><TableCell colSpan={7}><Skeleton className="h-10 w-full bg-admin-border" /></TableCell></TableRow>
              ))
            ) : filtered.map((req) => (
              <TableRow key={req.id} className="border-b-admin-border hover:bg-muted/50">
                <TableCell>
                  <p className="font-medium">{req.title}</p>
                  <p className="text-xs text-admin-foreground-muted">{req.category ?? "-"}</p>
                </TableCell>
                <TableCell><Badge variant="outline">{req.priority}</Badge></TableCell>
                <TableCell>
                  <Select value={req.status} onValueChange={(v) => updateStatus(req.id, v)}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abierto">Abierto</SelectItem>
                      <SelectItem value="en_progreso">En Progreso</SelectItem>
                      <SelectItem value="resuelto">Resuelto</SelectItem>
                      <SelectItem value="cerrado">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-xs">{req.requester_user_id}</TableCell>
                <TableCell className="text-xs">{req.assigned_to ?? '-'}</TableCell>
                <TableCell>{new Date(req.created_at).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SupportRequestModal isOpen={isNewOpen} onClose={() => setIsNewOpen(false)} onSuccess={fetchItems} />
    </AdminLayout>
  );
};

export default Soporte;