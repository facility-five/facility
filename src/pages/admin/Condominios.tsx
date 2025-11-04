import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Condo } from "@/components/admin/CondoCard";
import { NewCondoModal } from "@/components/admin/NewCondoModal";
import { DeleteCondoModal } from "@/components/admin/DeleteCondoModal";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { EditCondoModal } from "@/components/manager/EditCondoModal"; // Reusing EditCondoModal
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";

const Condominios = () => {
  const [condos, setCondos] = useState<Condo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Added for editing
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCondo, setSelectedCondo] = useState<Condo | null>(null); // Changed to store full condo object

  const fetchCondos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("condominiums") // Changed from "condos" to "condominiums"
      .select("*");

    if (error) {
      showRadixError("Erro ao buscar condomínios.");
    } else {
      setCondos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCondos();
  }, []);

  const handleDelete = async () => {
    if (!selectedCondo) return; // Use selectedCondo
    const { error } = await supabase
      .from("condominiums") // Changed from "condos" to "condominiums"
      .delete()
      .eq("id", selectedCondo.id); // Use selectedCondo.id

    if (error) {
      showRadixError(error.message);
    } else {
      showRadixSuccess("Condomínio excluído com sucesso!");
      fetchCondos();
    }
    setIsDeleteModalOpen(false);
    setSelectedCondo(null);
  };

  const openDeleteModal = (condo: Condo) => { // Changed to accept full condo object
    setSelectedCondo(condo);
    setIsDeleteModalOpen(true);
  };

  const handleEditCondo = (condo: Condo) => { // New function for editing
    setSelectedCondo(condo);
    setIsEditModalOpen(true);
  };

  const filteredCondos = condos.filter((condo) =>
    condo.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Condomínios</h1>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Buscar por nombre"
            className="w-64 bg-admin-card border-admin-border placeholder:text-admin-foreground-muted"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setIsNewModalOpen(true)}
          >
            Novo Condomínio
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-admin-border bg-admin-card">
        <Table>
          <TableHeader>
            <TableRow className="border-b-purple-700 bg-purple-600 hover:bg-purple-600">
              <TableHead className="text-white">Código</TableHead>
              <TableHead className="text-white">Nome</TableHead>
              <TableHead className="text-white">Endereço</TableHead>
              <TableHead className="text-white">Administradora</TableHead>
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
            ) : filteredCondos.length > 0 ? (
              filteredCondos.map((condo) => (
                <TableRow key={condo.id} className="border-b-admin-border hover:bg-muted/50">
                  <TableCell className="font-medium text-purple-400">{condo.code}</TableCell>
                  <TableCell className="font-medium">{condo.name}</TableCell>
                  <TableCell>{condo.address || 'N/A'}</TableCell>
                  <TableCell>{condo.administrator_name || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditCondo(condo)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteModal(condo)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-b-admin-border">
                <TableCell colSpan={5} className="text-center text-admin-foreground-muted">
                  Nenhum condomínio encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <NewCondoModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={fetchCondos}
      />
      <EditCondoModal // New EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchCondos}
        condo={selectedCondo}
        managerAdministratorId={null} // Admin can select any administrator
      />
      <DeleteCondoModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
};

export default Condominios;
