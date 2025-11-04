import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
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
import { NewUnitModal } from "@/components/admin/NewUnitModal";
import { DeleteUnitModal } from "@/components/admin/DeleteUnitModal";
import { cn } from "@/lib/utils";

export type Unit = {
  id: string;
  code: string;
  number: string; // Changed from block to number
  floor: number;
  size: string;
  rooms: number;
  has_parking: boolean;
  is_occupied: boolean;
  blocks: { name: string } | null;
  [key: string]: any;
};

const Units = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const fetchUnits = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("units")
      .select("*, blocks(name)")
      .order("created_at");

    if (error) {
      showRadixError("Erro ao buscar unidades.");
    } else {
      setUnits(data as any[] || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleNewUnit = () => {
    setSelectedUnit(null);
    setIsFormModalOpen(true);
  };

  const handleEditUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUnit) return;
    const { error } = await supabase.from("units").delete().eq("id", selectedUnit.id);

    if (error) {
      showRadixError(error.message);
    } else {
      showRadixSuccess("Unidade eliminada com sucesso!");
      fetchUnits();
    }
    setIsDeleteModalOpen(false);
    setSelectedUnit(null);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Unidades</h1>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={handleNewUnit}
        >
          Nova Unidade
        </Button>
      </div>

      <div className="rounded-lg border border-admin-border bg-admin-card">
        <Table>
          <TableHeader>
            <TableRow className="border-b-purple-700 bg-purple-600 hover:bg-purple-600">
              <TableHead className="text-white">Código</TableHead>
              <TableHead className="text-white">Número</TableHead>
              <TableHead className="text-white">Andar</TableHead>
              <TableHead className="text-white">Bloco</TableHead>
              <TableHead className="text-white">Tamanho</TableHead>
              <TableHead className="text-white">Quartos</TableHead>
              <TableHead className="text-white">Estacionamento</TableHead>
              <TableHead className="text-white text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b-admin-border">
                  <TableCell colSpan={8}>
                    <Skeleton className="h-8 w-full bg-admin-border" />
                  </TableCell>
                </TableRow>
              ))
            ) : units.length > 0 ? (
              units.map((unit) => (
                <TableRow key={unit.id} className="border-b-admin-border hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", unit.is_occupied ? "bg-red-500" : "bg-green-500")}></span>
                      <span className="font-medium text-purple-400">{unit.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>{unit.number}</TableCell>
                  <TableCell>{unit.floor}</TableCell>
                  <TableCell>{unit.blocks?.name || 'N/A'}</TableCell>
                  <TableCell>{unit.size}</TableCell>
                  <TableCell>{unit.rooms}</TableCell>
                  <TableCell>{unit.has_parking ? 'Sim' : 'Não'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditUnit(unit)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteModal(unit)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-b-admin-border">
                <TableCell colSpan={8} className="text-center text-admin-foreground-muted">
                  Nenhuma unidade encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <NewUnitModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchUnits}
        unit={selectedUnit}
      />
      <DeleteUnitModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
};

export default Units;
