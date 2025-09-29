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
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { PlanFormModal } from "@/components/admin/PlanFormModal";
import { DeletePlanModal } from "@/components/admin/DeletePlanModal";

export type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  period: string;
  status: string;
  features: string[] | null;
  [key: string]: any;
};

const Plans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("plans").select("*").order("created_at");

    if (error) {
      showError("Erro ao buscar planos.");
    } else {
      setPlans(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleNewPlan = () => {
    setSelectedPlan(null);
    setIsFormModalOpen(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedPlan) return;
    const { error } = await supabase.from("plans").delete().eq("id", selectedPlan.id);

    if (error) {
      showError(error.message);
    } else {
      showSuccess("Plano eliminado com sucesso!");
      fetchPlans();
    }
    setIsDeleteModalOpen(false);
    setSelectedPlan(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestionar Planes</h1>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={handleNewPlan}
        >
          + Novo Plano
        </Button>
      </div>

      <div className="rounded-lg border border-admin-border bg-admin-card">
        <Table>
          <TableHeader>
            <TableRow className="border-b-purple-700 bg-purple-600 hover:bg-purple-600">
              <TableHead className="text-white">Nome</TableHead>
              <TableHead className="text-white">Preço</TableHead>
              <TableHead className="text-white">Período</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="border-b-admin-border">
                  <TableCell colSpan={5}>
                    <Skeleton className="h-8 w-full bg-admin-border" />
                  </TableCell>
                </TableRow>
              ))
            ) : plans.length > 0 ? (
              plans.map((plan) => (
                <TableRow key={plan.id} className="border-b-admin-border">
                  <TableCell>
                    <p className="font-medium">{plan.name}</p>
                    <p className="text-sm text-admin-foreground-muted">{plan.description}</p>
                  </TableCell>
                  <TableCell>{formatCurrency(plan.price)}</TableCell>
                  <TableCell className="capitalize">{plan.period}</TableCell>
                  <TableCell>
                    <Badge variant={plan.status === 'active' ? 'default' : 'destructive'}>
                      {plan.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditPlan(plan)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteModal(plan)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-b-admin-border">
                <TableCell colSpan={5} className="text-center text-admin-foreground-muted">
                  Nenhum plano encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PlanFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchPlans}
        plan={selectedPlan}
      />
      <DeletePlanModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
};

export default Plans;