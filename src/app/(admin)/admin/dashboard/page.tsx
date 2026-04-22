"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AdminOverview } from "@/components/admin/overview-stats";
import { AdminOrderList } from "@/components/admin/order-list";
import { AdminProductList } from "@/components/admin/product-list";
import { AdminCategoryList } from "@/components/admin/category-list";
import { LogOut, Package, ShoppingBag, LayoutGrid, BarChart3 } from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent-blue)] flex items-center justify-center">
              <span className="text-white font-bold text-xs">TH</span>
            </div>
            <span className="font-bold font-heading">ToyHype Admin</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut className="w-4 h-4 mr-1" />
            {loggingOut ? "..." : "Logout"}
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-1.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Package className="w-4 h-4 mr-1.5" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="products">
              <ShoppingBag className="w-4 h-4 mr-1.5" />
              Products
            </TabsTrigger>
            <TabsTrigger value="categories">
              <LayoutGrid className="w-4 h-4 mr-1.5" />
              Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>
          <TabsContent value="orders">
            <AdminOrderList />
          </TabsContent>
          <TabsContent value="products">
            <AdminProductList />
          </TabsContent>
          <TabsContent value="categories">
            <AdminCategoryList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
