"use client"

import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface RevenueData {
  month_name: string;
  revenue: number;
}

export function RevenueChart() {
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_monthly_revenue');
      if (data) {
        setData(data);
      }
      if (error) {
        console.error("Error fetching revenue data:", error);
      }
      setLoading(false);
    };
    fetchRevenue();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita Mensal</CardTitle>
        <CardDescription>Receita dos últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="w-full h-[350px]" />
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month_name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `€${value}`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(167, 139, 250, 0.1)' }}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '0.5rem' }}
              />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}