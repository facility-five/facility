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
import { NewBlockModal } from "@/components/admin/NewBlockModal";
import { DeleteBlockModal } from "@/components/admin/DeleteBlockModal";

export type Block = {
  id: string;
  code: string;
  name: string;
  condo_id: string;
  responsible_id: string;
  status: string;
  condos: { name: string } | null;
  profiles: { first_name: string; last_name: string; email: string; } | null;
};

const Blocks = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

  const fetchBlocks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blocks")
      .select("*, condos(name), profiles(first_name, last_name, email)")
      .order("created_at");

    if (error) {
      showError("Erro ao buscar blocos.");
    } else {
      setBlocks(data as any[] || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  const handleNewBlock = () => {
    setSelectedBlock(null);
    setIsFormModalOpen(true);
  };

  const handleEditBlock = (block: Block) => {
    setSelectedBlock(block);
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (block: Block) => {
    setSelectedBlock(block);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedBlock) return;
    const { error } = await supabase.from("blocks").delete().eq("id", selectedBlock.id);

    if (error) {
      showError(error.message);
    } else {
      showSuccess("Bloque eliminado com sucesso!");
      fetchBlocks();
    }
    setIsDeleteModalOpen(false);
    setSelectedBlock(null);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bloques</h1>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={handleNewBlock}
        >
          Novo Bloque
        </Button>
      </div>

      <div className="rounded-lg border border-admin-border bg-admin-card">
        <Table>
          <TableHeader>
            <TableRow className="border-b-purple-700 bg-purple-600 hover:bg-purple-600">
              <TableHead className="text-white">Código</TableHead>
              <TableHead className="text-white">Nome</TableHead>
              <TableHead className="text-white">Condomínio</TableHead>
              <TableHead className="text-white">Responsável</TableHead>
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
            ) : blocks.length > 0 ? (
              blocks.map((block) => (
                <TableRow key={block.id} className="border-b-admin-border">
                  <TableCell className="font-medium text-purple-400">{block.code}</TableCell>
                  <TableCell className="font-medium">{block.name}</TableCell>
                  <TableCell>{block.condos?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <p className="font-medium">{`${block.profiles?.first_name || ''} ${block.profiles?.last_name || ''}`.trim()}</p>
                    <p className="text-sm text-admin-foreground-muted">{block.profiles?.email || ''}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditBlock(block)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteModal(block)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-b-admin-border">
                <TableCell colSpan={5} className="text-center text-admin-foreground-muted">
                  Nenhum bloque encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <NewBlockModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchBlocks}
        block={selectedBlock}
      />
      <DeleteBlockModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
};

export default Blocks;