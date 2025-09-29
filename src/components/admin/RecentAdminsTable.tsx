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

const admins = [
  { code: "AD-DG3SCC", name: "Jequiá Admin", responsible: "Gerente", email: "tools.condosystem@gmail.com", phone: "8282828282", date: "13/09/2025" },
  { code: "AD-GHAFJO", name: "Test Admin", responsible: "Fernando Morador Kepler", email: "clientes.bilingo@gmail.com", phone: "2525252525", date: "06/08/2025" },
  { code: "ISRKOS", name: "Grupo Thanks", responsible: "", email: "", phone: "5555555555", date: "25/07/2025" },
  { code: "AD-CW7R3D", name: "Finca teste 1", responsible: "Rangel Viana", email: "rangelconstruccionwebsite@gmail.com", phone: "643909129", date: "02/07/2025" },
];

export const RecentAdminsTable = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Administradoras recientes</CardTitle>
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
            {admins.map((admin) => (
              <TableRow key={admin.code}>
                <TableCell className="font-medium">{admin.code}</TableCell>
                <TableCell>{admin.name}</TableCell>
                <TableCell>
                    <p className="font-medium">{admin.responsible}</p>
                    <p className="text-xs text-gray-500">{admin.email}</p>
                </TableCell>
                <TableCell>{admin.phone}</TableCell>
                <TableCell className="text-right">{admin.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};