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

const payments = [
    { date: "13/09/2025", clientName: "Gerente", clientEmail: "tools.condosystem@gmail.com", plan: "Básico", value: "€ 497,00" },
    { date: "02/07/2025", clientName: "Rangel Viana", clientEmail: "rangelconstruccionwebsite@gmail.com", plan: "Básico", value: "€ 199,00" },
    { date: "27/06/2025", clientName: "Klebete Teste 1", clientEmail: "kleber.technet+1@gmail.com", plan: "Básico", value: "€ 199,00" },
    { date: "24/06/2025", clientName: "Klebete Teste", clientEmail: "kleber.technet@gmail.com", plan: "Básico", value: "€ 199,00" },
];

export const RecentPaymentsTable = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pagamentos Recentes</CardTitle>
        <Link to="#" className="text-sm font-medium text-purple-600 hover:underline">
          Ver Todos
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-purple-600">
            <TableRow>
              <TableHead className="text-white">Data</TableHead>
              <TableHead className="text-white">Cliente</TableHead>
              <TableHead className="text-white">Plano</TableHead>
              <TableHead className="text-white">Valor</TableHead>
              <TableHead className="text-white text-right">Ver</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment, index) => (
              <TableRow key={index}>
                <TableCell>{payment.date}</TableCell>
                <TableCell>
                    <p className="font-medium">{payment.clientName}</p>
                    <p className="text-xs text-gray-500">{payment.clientEmail}</p>
                </TableCell>
                <TableCell>{payment.plan}</TableCell>
                <TableCell>{payment.value}</TableCell>
                <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};