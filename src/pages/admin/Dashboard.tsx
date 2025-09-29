import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { RecentAdminsTable } from "@/components/admin/RecentAdminsTable";
import { RecentCondosTable } from "@/components/admin/RecentCondosTable";
import { RecentUnitsTable } from "@/components/admin/RecentUnitsTable";
import { RecentPaymentsTable } from "@/components/admin/RecentPaymentsTable";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { Building, Users, Building2, Euro } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [stats, setStats] = useState({
    admins: 0,
    users: 0,
    units: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const { count: adminsCount } = await supabase
        .from("administrators")
        .select("*", { count: "exact", head: true });

      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: unitsCount } = await supabase
        .from("units")
        .select("*", { count: "exact", head: true });

      const { data: payments } = await supabase.from("payments").select("amount");
      const monthlyRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

      setStats({
        admins: adminsCount || 0,
        users: usersCount || 0,
        units: unitsCount || 0,
        revenue: monthlyRevenue,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Administradores Totales" value={loading ? "..." : stats.admins.toString()} icon={Building} />
        <StatCard title="Total de Usuários" value={loading ? "..." : stats.users.toString()} icon={Users} />
        <StatCard title="Unidades Totales" value={loading ? "..." : stats.units.toString()} icon={Building2} />
        <StatCard title="Ingresos mensuales" value={loading ? "..." : formatCurrency(stats.revenue)} icon={Euro} />
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