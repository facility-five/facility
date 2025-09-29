import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { RecentAdminsTable } from "@/components/admin/RecentAdminsTable";
import { RecentCondosTable } from "@/components/admin/RecentCondosTable";
import { RecentUnitsTable } from "@/components/admin/RecentUnitsTable";
import { RecentPaymentsTable } from "@/components/admin/RecentPaymentsTable";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { Building, Users, Building2, Euro } from "lucide-react";

const Dashboard = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Administradores Totales" value="8" icon={Building} />
        <StatCard title="Total de Usuários" value="9" icon={Users} />
        <StatCard title="Unidades Totales" value="5" icon={Building2} />
        <StatCard title="Ingresos mensuales" value="€4.276,00" icon={Euro} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <RevenueChart />
        <RecentPaymentsTable />
      </div>
      <div className="space-y-8">
        <RecentAdminsTable />
        <RecentCondosTable />
        <RecentUnitsTable />
      </div>
    </AdminLayout>
  );
};

export default Dashboard;