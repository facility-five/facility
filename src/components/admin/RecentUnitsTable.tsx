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

type Unit = {
  code: string;
  number: string; // Changed from block to number
  created_at: string;
  condominiums: { // Changed from condos to condominiums
    name: string;
    administrators: {
      name: string;
    } | null;
  } | null;
  blocks: { // Added blocks
    name: string;
  } | null;
};

export const RecentUnitsTable = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnits = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("units")
        .select("*, condominiums(name, administrators(name)), blocks(name)") // Updated select to condominiums and blocks
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Error fetching units:", error);
        setUnits([]);
      } else {
        setUnits(data as Unit[] || []);
      }
      setLoading(false);
    };
    fetchUnits();
  }, []);

  return (
    <Card className="bg-admin-card border-admin-border text-admin-foreground">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Unidades Recentes</CardTitle>
        <Link to="/admin/unidades" className="text-sm font-medium text-purple-400 hover:underline">
          Ver Todos
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-purple-600">
            <TableRow className="border-b-purple-700 hover:bg-purple-600">
              <TableHead className="text-white">Código</TableHead>
              <TableHead className="text-white">Administradora</TableHead>
              <TableHead className="text-white">Condominio</TableHead>
              <TableHead className="text-white">Bloque</TableHead>
              <TableHead className="text-white">Número</TableHead>
              <TableHead className="text-white text-right">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="border-b-admin-border">
                  <TableCell colSpan={6}><Skeleton className="h-8 w-full bg-admin-border" /></TableCell>
                </TableRow>
              ))
            ) : units.length > 0 ? (
              units.map((unit) => (
                <TableRow key={unit.code} className="border-b-admin-border">
                  <TableCell className="font-medium">{unit.code}</TableCell>
                  <TableCell>{unit.condominiums?.administrators?.name || 'N/A'}</TableCell>
                  <TableCell>{unit.condominiums?.name || 'N/A'}</TableCell>
                  <TableCell>{unit.blocks?.name || 'N/A'}</TableCell>
                  <TableCell>{unit.number}</TableCell>
                  <TableCell className="text-right">{new Date(unit.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-b-admin-border">
                <TableCell colSpan={6} className="text-center text-admin-foreground-muted">Nenhuma unidade encontrada.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};