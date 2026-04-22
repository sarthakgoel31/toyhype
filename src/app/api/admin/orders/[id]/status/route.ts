import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderShipped } from "@/lib/email";
import type { Order } from "@/types/database";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, tracking_number, tracking_url } = await request.json();

    if (!status) {
      return NextResponse.json({ error: "Status required" }, { status: 400 });
    }

    const supabase = createAdminClient();

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

    const { data: order, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    // Send shipped email
    if (status === "SHIPPED" && tracking_number) {
      sendOrderShipped(order as Order, tracking_number, tracking_url);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update order status error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
