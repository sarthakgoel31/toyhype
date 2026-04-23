import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderShipped, sendOrderCancelled, sendReturnUpdate } from "@/lib/email";
import type { Order, OrderItem } from "@/types/database";

// Statuses that should restore stock (order won't be fulfilled)
const STOCK_RESTORE_STATUSES = ["CANCELLED", "RTO", "RETURNED"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, tracking_number, tracking_url, reason } = await request.json();

    if (!status) {
      return NextResponse.json({ error: "Status required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch current order + items before updating
    const { data: currentOrder } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "SHIPPED") {
      updateData.shipped_at = new Date().toISOString();
      if (tracking_number) updateData.tracking_number = tracking_number;
      if (tracking_url) updateData.tracking_url = tracking_url;
    }

    if (status === "DELIVERED") {
      updateData.delivered_at = new Date().toISOString();
    }

    if (reason) {
      updateData.admin_notes = reason;
    }

    const { data: order, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    // Restore stock if moving to a terminal "not fulfilled" status
    // Only restore if the previous status wasn't already a restore status
    const prevAlreadyRestored = STOCK_RESTORE_STATUSES.includes(currentOrder.status);
    if (STOCK_RESTORE_STATUSES.includes(status) && !prevAlreadyRestored) {
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
    }

    // Send emails based on status change
    if (status === "SHIPPED" && tracking_number) {
      sendOrderShipped(order as Order, tracking_number, tracking_url);
    }

    if (status === "CANCELLED") {
      sendOrderCancelled(order as Order, reason);
    }

    if (status === "RETURN_REQUESTED" || status === "RETURNED") {
      sendReturnUpdate(order as Order, status);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update order status error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
