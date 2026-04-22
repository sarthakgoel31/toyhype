import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmation, sendAdminNotification } from "@/lib/email";
import type { Order, OrderItem } from "@/types/database";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify HMAC signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const supabase = createAdminClient();

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      // Find order by razorpay_order_id
      const { data: order, error } = await supabase
        .from("orders")
        .select("*")
        .eq("razorpay_order_id", razorpayOrderId)
        .single();

      if (error || !order) {
        console.error("Order not found for webhook:", razorpayOrderId);
        return NextResponse.json({ status: "order_not_found" });
      }

      // Skip if already confirmed
      if (order.status !== "PAYMENT_PENDING") {
        return NextResponse.json({ status: "already_confirmed" });
      }

      // Verify amount
      if (Number(payment.amount) !== order.total_amount) {
        console.error("Webhook amount mismatch:", payment.amount, order.total_amount);
        return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
      }

      // Confirm order
      await supabase
        .from("orders")
        .update({
          status: "CONFIRMED",
          payment_status: "captured",
          razorpay_payment_id: payment.id,
          confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      // Fetch items and send emails
      const { data: items } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);

      const confirmedOrder: Order = { ...order, status: "CONFIRMED" };
      const orderItems = (items || []) as OrderItem[];

      await sendOrderConfirmation(confirmedOrder, orderItems);
      await sendAdminNotification(confirmedOrder, orderItems);

      return NextResponse.json({ status: "confirmed" });
    }

    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      await supabase
        .from("orders")
        .update({
          status: "PAYMENT_FAILED",
          payment_status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("razorpay_order_id", razorpayOrderId);

      return NextResponse.json({ status: "marked_failed" });
    }

    return NextResponse.json({ status: "unhandled_event" });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
