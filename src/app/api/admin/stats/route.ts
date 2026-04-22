import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const [ordersRes, revenueRes, pendingRes, lowStockRes] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }).not("status", "eq", "PAYMENT_PENDING"),
      supabase.from("orders").select("total_amount").in("status", ["CONFIRMED", "SHIPPED", "DELIVERED"]),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "CONFIRMED"),
      supabase.from("products").select("id", { count: "exact", head: true }).lt("stock_quantity", 5).eq("is_active", true),
    ]);

    const totalRevenue = (revenueRes.data || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);

    return NextResponse.json({
      totalOrders: ordersRes.count || 0,
      totalRevenue,
      pendingOrders: pendingRes.count || 0,
      lowStockProducts: lowStockRes.count || 0,
    });
  } catch (err) {
    console.error("Stats error:", err);
    return NextResponse.json({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, lowStockProducts: 0 });
  }
}
