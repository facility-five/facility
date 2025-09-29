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

const condos = [
    { code: "CO-ICZEUV", name: "Condomínio Dunas", responsible: "Fernando Teste 1", email: "5fiveagencia+teste1@gmail.com", phone: "22 3344 5566", date: "23/05/2025" },
];

export const RecentCondosTable = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Condominios Recientes</CardTitle>
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
              <TableHead className="text-white">Responsável</TableHead>
              <TableHead className="text-white">Telefone</TableHead>
              <TableHead className="text-white text-right">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {condos.map((condo) => (
              <TableRow key={condo.code}>
                <TableCell className="font-medium">{condo.code}</TableCell>
                <TableCell>{condo.name}</TableCell>
                <TableCell>
                    <p className="font-medium">{condo.responsible}</p>
                    <p className="text-xs text-gray-500">{condo.email}</p>
                </TableCell>
                <TableCell>{condo.phone}</TableCell>
                <TableCell className="text-right">{condo.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};