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

type Condo = {
  code: string;
  name: string;
  responsible_name: string;
  responsible_email: string;
  phone: string;
  created_at: string;
};

export const RecentCondosTable = () => {
  const [condos, setCondos] = useState<Condo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCondos = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("condos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);
      setCondos(data || []);
      setLoading(false);
    };
    fetchCondos();
  }, []);

  return (
    <Card className="bg-admin-card border-admin-border text-admin-foreground">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Condominios Recientes</CardTitle>
        <Link to="#" className="text-sm font-medium text-purple-400 hover:underline">
          Ver Todos
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-purple-600">
            <TableRow className="border-b-purple-700 hover:bg-purple-600">
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
            ) : condos.length > 0 ? (
              condos.map((condo) => (
                <TableRow key={condo.code} className="border-b-admin-border">
                  <TableCell className="font-medium">{condo.code}</TableCell>
                  <TableCell>{condo.name}</TableCell>
                  <TableCell>
                      <p className="font-medium">{condo.responsible_name}</p>
                      <p className="text-xs text-admin-foreground-muted">{condo.responsible_email}</p>
                  </TableCell>
                  <TableCell>{condo.phone}</TableCell>
                  <TableCell className="text-right">{new Date(condo.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-b-admin-border">
                <TableCell colSpan={5} className="text-center text-admin-foreground-muted">Nenhum condomínio encontrado.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};