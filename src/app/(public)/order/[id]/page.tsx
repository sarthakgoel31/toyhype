import { createPublicClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { OrderConfirmation } from "./order-confirmation";
import type { Order, OrderItem } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createPublicClient();

  const [orderRes, itemsRes] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).single(),
    supabase.from("order_items").select("*").eq("order_id", id),
  ]);

  if (!orderRes.data) notFound();

  return (
    <OrderConfirmation
      order={orderRes.data as Order}
      items={(itemsRes.data || []) as OrderItem[]}
    />
  );
}
