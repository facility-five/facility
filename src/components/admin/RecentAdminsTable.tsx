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
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

type Admin = {
  code: string;
  name: string;
  responsible_name: string;
  responsible_email: string;
  phone: string;
  created_at: string;
};

export const RecentAdminsTable = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("administrators")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);
      setAdmins(data || []);
      setLoading(false);
    };
    fetchAdmins();
  }, []);

  return (
    <Card className="bg-admin-card border-admin-border text-admin-foreground">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Administradoras recientes</CardTitle>
        <Link to="#" className="text-sm font-medium text-purple-400 hover:underline">
          Ver Todos
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-purple-600">
            <TableRow className="border-b-purple-700">
              <TableHead className="text-white">Código</TableHead>
              <TableHead className="text-white">Nombre del administrador</TableHead>
              <TableHead className="text-white">Responsável</TableHead>
              <TableHead className="text-white">Telefone</TableHead>
              <TableHead className="text-white text-right">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="border-b-admin-border">
                  <TableCell colSpan={5}><Skeleton className="h-8 w-full bg-admin-border" /></TableCell>
                </TableRow>
              ))
            ) : admins.length > 0 ? (
              admins.map((admin) => (
                <TableRow key={admin.code} className="border-b-admin-border">
                  <TableCell className="font-medium">{admin.code}</TableCell>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>
                      <p className="font-medium">{admin.responsible_name}</p>
                      <p className="text-xs text-admin-foreground-muted">{admin.responsible_email}</p>
                  </TableCell>
                  <TableCell>{admin.phone}</TableCell>
                  <TableCell className="text-right">{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-b-admin-border">
                <TableCell colSpan={5} className="text-center text-admin-foreground-muted">Nenhuma administradora encontrada.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};