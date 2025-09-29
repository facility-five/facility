import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { NewCommunicationModal } from "@/components/admin/NewCommunicationModal";
import { DeleteCommunicationModal } from "@/components/admin/DeleteCommunicationModal";

export type Communication = {
  id: string;
  code: string;
  title: string;
  content: string;
  expiration_date: string;
  condos: { name: string } | null;
  [key: string]: any;
};

const Communications = () => {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);

  const fetchCommunications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("communications")
      .select("*, condos(name)")
      .order("created_at", { ascending: false });

    if (error) {
      showError("Erro ao buscar comunicados.");
    } else {
      setCommunications(data as any[] || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCommunications();
  }, []);

  const handleNew = () => {
    setSelectedCommunication(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (comm: Communication) => {
    setSelectedCommunication(comm);
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (comm: Communication) => {
    setSelectedCommunication(comm);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCommunication) return;
    const { error } = await supabase.from("communications").delete().eq("id", selectedCommunication.id);

    if (error) {
      showError(error.message);
    } else {
      showSuccess("Comunicado excluído com sucesso!");
      fetchCommunications();
    }
    setIsDeleteModalOpen(false);
    setSelectedCommunication(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-PT').format(date);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Comunicados</h1>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={handleNew}
        >
          + Novo Comunicado
        </Button>
      </div>

      <div className="rounded-lg border border-admin-border bg-admin-card">
        <Table>
          <TableHeader>
            <TableRow className="border-b-purple-700 bg-purple-600 hover:bg-purple-600">
              <TableHead className="text-white">Código</TableHead>
              <TableHead className="text-white">Título</TableHead>
              <TableHead className="text-white">Condomínio</TableHead>
              <TableHead className="text-white">Data de Expiração</TableHead>
              <TableHead className="text-white text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b-admin-border">
                  <TableCell colSpan={5}>
                    <Skeleton className="h-8 w-full bg-admin-border" />
                  </TableCell>
                </TableRow>
              ))
            ) : communications.length > 0 ? (
              communications.map((comm) => (
                <TableRow key={comm.id} className="border-b-admin-border">
                  <TableCell className="font-medium text-purple-400">{comm.code}</TableCell>
                  <TableCell>
                    <p className="font-medium">{comm.title}</p>
                    <p className="text-sm text-admin-foreground-muted">{comm.content}</p>
                  </TableCell>
                  <TableCell>{comm.condos?.name || 'N/A'}</TableCell>
                  <TableCell>{formatDate(comm.expiration_date)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(comm)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteModal(comm)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-b-admin-border">
                <TableCell colSpan={5} className="text-center text-admin-foreground-muted">
                  Nenhum comunicado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <NewCommunicationModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchCommunications}
        communication={selectedCommunication}
      />
      <DeleteCommunicationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
};

export default Communications;