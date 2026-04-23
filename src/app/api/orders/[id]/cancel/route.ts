import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderCancelled } from "@/lib/email";
import type { Order } from "@/types/database";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Fetch the order
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow cancellation if COD + not yet shipped
    if (order.payment_status !== "cod") {
      return NextResponse.json(
        { error: "Only COD orders can be self-cancelled. For online payments, contact us on WhatsApp." },
        { status: 400 }
      );
    }

    if (!["CONFIRMED", "PAYMENT_PENDING"].includes(order.status)) {
      return NextResponse.json(
        { error: "This order has already been shipped and cannot be cancelled." },
        { status: 400 }
      );
    }

    // Cancel the order
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "CANCELLED",
        admin_notes: "Cancelled by customer",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) throw updateError;

    // Restore stock
    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", id);

    if (items) {
      for (const item of items) {
        if (item.product_id) {
          await supabase.rpc("increment_stock", {
            p_id: item.product_id,
            qty: item.quantity,
          });
        }
      }
    }

    // Send cancellation email
    sendOrderCancelled(order as Order, "Cancelled by you");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Cancel order error:", err);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
