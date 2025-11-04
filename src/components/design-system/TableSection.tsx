import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Trash2, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ManagerTable,
  ManagerTableBody,
  ManagerTableCell,
  ManagerTableHead,
  ManagerTableHeader,
  ManagerTableRow,
} from '@/components/manager/ManagerTable';

export const TableSection = () => {
  const sampleData = [
    {
      id: '1',
      code: 'ADM001',
      name: 'Administradora Central',
      responsible: 'João Silva',
      email: 'joao@central.com',
      phone: '+55 11 99999-9999',
      status: 'Ativo',
      condos: 15,
      created_at: '2024-01-15'
    },
    {
      id: '2',
      code: 'ADM002',
      name: 'Gestão Imobiliária Plus',
      responsible: 'Maria Santos',
      email: 'maria@plus.com',
      phone: '+55 11 88888-8888',
      status: 'Ativo',
      condos: 8,
      created_at: '2024-01-20'
    },
    {
      id: '3',
      code: 'ADM003',
      name: 'Condomínios & Cia',
      responsible: 'Pedro Costa',
      email: 'pedro@condominios.com',
      phone: '+55 11 77777-7777',
      status: 'Inativo',
      condos: 3,
      created_at: '2024-01-25'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-admin-foreground">Tabelas</h2>
      <Separator className="bg-admin-border" />

      <div className="space-y-8">
        {/* Tabela Padrão Admin */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Tabela Padrão (Admin)</h3>
          <p className="text-admin-foreground-muted">
            Tabela padrão utilizada no ambiente administrativo com estilo roxo.
          </p>
          <div className="rounded-lg border border-admin-border bg-admin-card">
            <Table>
              <TableHeader>
                <TableRow className="border-b-purple-700 bg-purple-600">
                  <TableHead className="text-white">Código</TableHead>
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Responsável</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Condomínios</TableHead>
                  <TableHead className="text-white text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleData.map((item) => (
                  <TableRow key={item.id} className="border-b-admin-border hover:bg-muted/50">
                    <TableCell className="font-medium text-purple-400">{item.code}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.responsible}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'Ativo' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {item.condos} condomínios
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Tabela Manager */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Tabela Manager</h3>
          <p className="text-admin-foreground-muted">
            Tabela utilizada no ambiente do gestor com estilo diferenciado.
          </p>
          <ManagerTable>
            <ManagerTableHeader>
              <ManagerTableRow>
                <ManagerTableHead>Código</ManagerTableHead>
                <ManagerTableHead>Nome</ManagerTableHead>
                <ManagerTableHead>Responsável</ManagerTableHead>
                <ManagerTableHead>E-mail</ManagerTableHead>
                <ManagerTableHead>Telefone</ManagerTableHead>
                <ManagerTableHead>Status</ManagerTableHead>
              </ManagerTableRow>
            </ManagerTableHeader>
            <ManagerTableBody>
              {sampleData.map((item) => (
                <ManagerTableRow key={item.id} className="hover:bg-gray-50">
                  <ManagerTableCell className="font-medium">{item.code}</ManagerTableCell>
                  <ManagerTableCell className="font-medium">{item.name}</ManagerTableCell>
                  <ManagerTableCell>{item.responsible}</ManagerTableCell>
                  <ManagerTableCell>{item.email}</ManagerTableCell>
                  <ManagerTableCell>{item.phone}</ManagerTableCell>
                  <ManagerTableCell>
                    <Badge variant={item.status === 'Ativo' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </ManagerTableCell>
                </ManagerTableRow>
              ))}
            </ManagerTableBody>
          </ManagerTable>
        </div>

        {/* Estados de Carregamento */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Estados de Carregamento</h3>
          <p className="text-admin-foreground-muted">
            Exemplo de como as tabelas aparecem durante o carregamento de dados.
          </p>
          <div className="rounded-lg border border-admin-border bg-admin-card">
            <Table>
              <TableHeader>
                <TableRow className="border-b-purple-700 bg-purple-600">
                  <TableHead className="text-white">Código</TableHead>
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Responsável</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-b-admin-border hover:bg-muted/50">
                    <TableCell><Skeleton className="h-4 w-16 bg-admin-border" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 bg-admin-border" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 bg-admin-border" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 bg-admin-border" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 bg-admin-border" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Estado Vazio */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Estado Vazio</h3>
          <p className="text-admin-foreground-muted">
            Como as tabelas aparecem quando não há dados para exibir.
          </p>
          <div className="rounded-lg border border-admin-border bg-admin-card">
            <Table>
              <TableHeader>
                <TableRow className="border-b-purple-700 bg-purple-600">
                  <TableHead className="text-white">Código</TableHead>
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Responsável</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-b-admin-border">
                  <TableCell colSpan={5} className="text-center text-admin-foreground-muted py-8">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};