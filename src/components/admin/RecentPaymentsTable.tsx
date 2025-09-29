import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

type Payment = {
  created_at: string;
  plan: string;
  amount: number;
  profiles: {
    first_name: string;
    last_name: string;
  } | null;
};

export const RecentPaymentsTable = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("payments")
        .select("*, profiles(first_name, last_name)")
        .order("created_at", { ascending: false })
        .limit(4);
      setPayments(data as Payment[] || []);
      setLoading(false);
    };
    fetchPayments();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <Card className="bg-admin-card border-admin-border text-admin-foreground">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pagamentos Recentes</CardTitle>
        <Link to="#" className="text-sm font-medium text-purple-400 hover:underline">
          Ver Todos
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-purple-600">
            <TableRow className="border-b-purple-700">
              <TableHead className="text-white">Data</TableHead>
              <TableHead className="text-white">Cliente</TableHead>
              <TableHead className="text-white">Plano</TableHead>
              <TableHead className="text-white">Valor</TableHead>
              <TableHead className="text-white text-right">Ver</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="border-b-admin-border">
                  <TableCell colSpan={5}><Skeleton className="h-8 w-full bg-admin-border" /></TableCell>
                </TableRow>
              ))
            ) : payments.length > 0 ? (
              payments.map((payment, index) => (
                <TableRow key={index} className="border-b-admin-border">
                  <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                      <p className="font-medium">{`${payment.profiles?.first_name || ''} ${payment.profiles?.last_name || ''}`.trim()}</p>
                  </TableCell>
                  <TableCell>{payment.plan}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                      </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-b-admin-border">
                <TableCell colSpan={5} className="text-center text-admin-foreground-muted">Nenhum pagamento encontrado.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};