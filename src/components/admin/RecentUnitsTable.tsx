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

const units = [
    { code: "UN-INXAVN", admin: "Grupo Dunas", condo: "Vila do Chaves", block: "Bloco B", date: "15/06/2025" },
    { code: "UN-9FRXXR", admin: "Grupo Dunas", condo: "Vila do Chaves", block: "Bloco A", date: "15/06/2025" },
    { code: "UN-IJ61KQ", admin: "Condomínio Jardim Five", condo: "Condomínio Jardim Five", block: "Bloco A", date: "01/07/2025" },
    { code: "UN-ALHOC2", admin: "Grupo Dunas", condo: "Vila do Chaves", block: "Bloco A", date: "25/07/2025" },
];

export const RecentUnitsTable = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Unidades Recentes</CardTitle>
        <Link to="#" className="text-sm font-medium text-purple-600 hover:underline">
          Ver Todos
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-purple-600">
            <TableRow>
              <TableHead className="text-white">Código</TableHead>
              <TableHead className="text-white">Nombre del administrador</TableHead>
              <TableHead className="text-white">Condominio</TableHead>
              <TableHead className="text-white">Bloque</TableHead>
              <TableHead className="text-white text-right">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit.code}>
                <TableCell className="font-medium">{unit.code}</TableCell>
                <TableCell>{unit.admin}</TableCell>
                <TableCell>{unit.condo}</TableCell>
                <TableCell>{unit.block}</TableCell>
                <TableCell className="text-right">{unit.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};