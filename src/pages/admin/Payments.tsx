import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

type Payment = {
  id: string;
  created_at: string;
  plan: string;
  amount: number;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
};

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_all_payments_with_profile");
      if (error) {
        showError("Erro ao buscar pagamentos.");
        setPayments([]);
      } else {
        const mapped = (data || []).map((row: any) => ({
          id: row.id,
          created_at: row.created_at,
          plan: row.plan,
          amount: Number(row.amount),
          profiles: row.first_name || row.last_name || row.email ? { first_name: row.first_name, last_name: row.last_name, email: row.email } : null,
        })) as Payment[];
        setPayments(mapped);
      }
      setLoading(false);
    };
    fetchPayments();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Historial de Pagos</h1>
        <p className="text-admin-foreground-muted">Lista completa de todos los pagos recibidos</p>
      </div>

      <div className="rounded-lg border border-admin-border bg-admin-card">
        <Table>
          <TableHeader>
            <TableRow className="border-b-purple-700 bg-purple-600 hover:bg-purple-600">
              <TableHead className="text-white">Data</TableHead>
              <TableHead className="text-white">Código</TableHead>
              <TableHead className="text-white">Cliente</TableHead>
              <TableHead className="text-white">Plano</TableHead>
              <TableHead className="text-white">Valor</TableHead>
              <TableHead className="text-white text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i} className="border-b-admin-border">
                  <TableCell colSpan={6}>
                    <Skeleton className="h-10 w-full bg-admin-border" />
                  </TableCell>
                </TableRow>
              ))
            ) : payments.map((payment) => (
              <TableRow key={payment.id} className="border-b-admin-border">
                <TableCell>{formatDate(payment.created_at)}</TableCell>
                <TableCell className="font-medium">{payment.id.substring(0, 15).toUpperCase()}</TableCell>
                <TableCell>
                  <p className="font-medium">{`${payment.profiles?.first_name || ''} ${payment.profiles?.last_name || ''}`.trim()}</p>
                  <p className="text-sm text-admin-foreground-muted">{payment.profiles?.email}</p>
                </TableCell>
                <TableCell>{payment.plan}</TableCell>
                <TableCell>{formatCurrency(payment.amount)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default Payments;