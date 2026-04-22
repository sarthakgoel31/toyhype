import { NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmation, sendAdminNotification } from "@/lib/email";
import type { Order, OrderItem } from "@/types/database";

export async function POST(request: Request) {
  try {
    const { orderId, razorpay_payment_id, razorpay_order_id } = await request.json();

    if (!orderId || !razorpay_payment_id || !razorpay_order_id) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "PAYMENT_PENDING") {
      return NextResponse.json({ success: true, message: "Already confirmed" });
    }

    // Verify payment with Razorpay
    const razorpay = getRazorpay();
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== "captured" && payment.status !== "authorized") {
      return NextResponse.json({ error: "Payment not captured" }, { status: 400 });
    }

    if (Number(payment.amount) !== order.total_amount) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // Confirm order
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "CONFIRMED",
        payment_status: "captured",
        razorpay_payment_id,
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Order update failed:", updateError);
      return NextResponse.json({ error: "Failed to confirm order" }, { status: 500 });
    }

    // Fetch order items for email
    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    // Send emails (non-blocking)
    const confirmedOrder: Order = { ...order, status: "CONFIRMED", razorpay_payment_id };
    const orderItems = (items || []) as OrderItem[];

    sendOrderConfirmation(confirmedOrder, orderItems);
    sendAdminNotification(confirmedOrder, orderItems);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verify payment error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
