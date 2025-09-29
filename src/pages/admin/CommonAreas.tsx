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
import { NewCommonAreaModal } from "@/components/admin/NewCommonAreaModal";
import { DeleteCommonAreaModal } from "@/components/admin/DeleteCommonAreaModal";

export type CommonArea = {
  id: string;
  code: string;
  name: string;
  description: string;
  capacity: number;
  opening_time: string;
  closing_time: string;
  booking_fee: number;
  condos: { name: string } | null;
  [key: string]: any;
};

const CommonAreas = () => {
  const [areas, setAreas] = useState<CommonArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<CommonArea | null>(null);

  const fetchAreas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("common_areas")
      .select("*, condos(name)")
      .order("created_at");

    if (error) {
      showError("Erro ao buscar áreas comuns.");
    } else {
      setAreas(data as any[] || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleNewArea = () => {
    setSelectedArea(null);
    setIsFormModalOpen(true);
  };

  const handleEditArea = (area: CommonArea) => {
    setSelectedArea(area);
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (area: CommonArea) => {
    setSelectedArea(area);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedArea) return;
    const { error } = await supabase.from("common_areas").delete().eq("id", selectedArea.id);

    if (error) {
      showError(error.message);
    } else {
      showSuccess("Área comum eliminada com sucesso!");
      fetchAreas();
    }
    setIsDeleteModalOpen(false);
    setSelectedArea(null);
  };

  const formatTime = (time: string) => time ? time.substring(0, 5) : '-';
  const formatCurrency = (value: number) => value ? new Intl.NumberFormat("pt-PT").format(value) : '-';

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Áreas Comunes</h1>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={handleNewArea}
        >
          + Nueva Área Común
        </Button>
      </div>

      <div className="rounded-lg border border-admin-border bg-admin-card">
        <Table>
          <TableHeader>
            <TableRow className="border-b-purple-700 bg-purple-600 hover:bg-purple-600">
              <TableHead className="text-white">Código</TableHead>
              <TableHead className="text-white">Nombre</TableHead>
              <TableHead className="text-white">Condominio</TableHead>
              <TableHead className="text-white">Capacidade</TableHead>
              <TableHead className="text-white">Horario</TableHead>
              <TableHead className="text-white">Valor</TableHead>
              <TableHead className="text-white text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b-admin-border">
                  <TableCell colSpan={7}>
                    <Skeleton className="h-8 w-full bg-admin-border" />
                  </TableCell>
                </TableRow>
              ))
            ) : areas.length > 0 ? (
              areas.map((area) => (
                <TableRow key={area.id} className="border-b-admin-border">
                  <TableCell className="font-medium text-purple-400">{area.code}</TableCell>
                  <TableCell>
                    <p className="font-medium">{area.name}</p>
                    <p className="text-sm text-admin-foreground-muted">{area.description}</p>
                  </TableCell>
                  <TableCell>{area.condos?.name || 'N/A'}</TableCell>
                  <TableCell>{area.capacity || '-'}</TableCell>
                  <TableCell>{`${formatTime(area.opening_time)} - ${formatTime(area.closing_time)}`}</TableCell>
                  <TableCell>{formatCurrency(area.booking_fee)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditArea(area)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteModal(area)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-b-admin-border">
                <TableCell colSpan={7} className="text-center text-admin-foreground-muted">
                  Nenhuma área comum encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <NewCommonAreaModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchAreas}
        commonArea={selectedArea}
      />
      <DeleteCommonAreaModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
};

export default CommonAreas;