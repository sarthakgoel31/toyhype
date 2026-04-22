import { NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { orderId, amount } = await request.json();

    if (!orderId || !amount) {
      return NextResponse.json({ error: "Missing orderId or amount" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify amount matches DB (prevent tampering)
    const { data: order, error } = await supabase
      .from("orders")
      .select("total_amount, status")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "PAYMENT_PENDING") {
      return NextResponse.json({ error: "Order already processed" }, { status: 400 });
    }

    if (order.total_amount !== amount) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // Create Razorpay order
    const razorpay = getRazorpay();
    const rzpOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: orderId,
    });

    // Save razorpay_order_id
    await supabase
      .from("orders")
      .update({ razorpay_order_id: rzpOrder.id })
      .eq("id", orderId);

    return NextResponse.json({
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
    });
  } catch (err) {
    console.error("Create Razorpay order error:", err);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
