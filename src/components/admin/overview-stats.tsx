"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, IndianRupee, ShoppingBag, AlertTriangle } from "lucide-react";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
}

export function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          setStats(await res.json());
        }
      } catch {
        // Stats will remain at 0
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const cards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: Package,
      color: "text-[var(--accent-blue)]",
      bg: "bg-blue-50",
    },
    {
      title: "Revenue",
      value: `Rs ${Math.round(stats.totalRevenue / 100).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "text-[var(--accent-green)]",
      bg: "bg-green-50",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: ShoppingBag,
      color: "text-[var(--accent-orange)]",
      bg: "bg-orange-50",
    },
    {
      title: "Low Stock",
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: "text-[var(--accent-red)]",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
              {card.title}
            </CardTitle>
            <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {loading ? "..." : card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
