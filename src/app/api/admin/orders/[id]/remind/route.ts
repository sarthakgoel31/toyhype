import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPaymentReminder } from "@/lib/email";
import type { Order } from "@/types/database";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "PAYMENT_PENDING") {
      return NextResponse.json(
        { error: "Reminder can only be sent for pending payments" },
        { status: 400 }
      );
    }

    await sendPaymentReminder(order as Order);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Send reminder error:", err);
    return NextResponse.json({ error: "Failed to send reminder" }, { status: 500 });
  }
}
