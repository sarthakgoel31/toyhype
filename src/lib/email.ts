import type { Order, OrderItem } from "@/types/database";

let resend: { emails: { send: (opts: Record<string, unknown>) => Promise<unknown> } } | null = null;

function getResend() {
  if (!resend) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Resend } = require("resend");
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend!;
}

const FROM_EMAIL = "ToyHype <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "sarthak.goel01@gmail.com";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function sendOrderConfirmation(order: Order, items: OrderItem[]) {
  try {
    const itemRows = items
      .map(
        (i) =>
          `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.product_name} x${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">Rs ${Math.round(i.price_at_purchase * i.quantity / 100)}</td></tr>`
      )
      .join("");

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Order Confirmed - ${order.order_number}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <div style="text-align:center;margin-bottom:30px">
            <h1 style="color:#3b82f6;margin:0">ToyHype</h1>
          </div>
          <h2 style="color:#18181b">Order Confirmed! 🎉</h2>
          <p style="color:#52525b">Hi ${order.customer_name}, your order has been placed successfully.</p>
          <div style="background:#f5f5f5;padding:16px;border-radius:12px;margin:20px 0">
            <p style="margin:0;font-size:14px;color:#52525b">Order Number</p>
            <p style="margin:4px 0 0;font-weight:bold;font-size:18px">${order.order_number}</p>
          </div>
          <table style="width:100%;border-collapse:collapse">
            <thead><tr><th style="text-align:left;padding:8px;border-bottom:2px solid #e5e5e5">Item</th><th style="text-align:right;padding:8px;border-bottom:2px solid #e5e5e5">Amount</th></tr></thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr><td style="padding:8px;font-weight:bold">Total</td><td style="padding:8px;font-weight:bold;text-align:right">Rs ${Math.round(order.total_amount / 100)}</td></tr>
            </tfoot>
          </table>
          <div style="margin-top:30px;text-align:center">
            <a href="${BASE_URL}/track" style="background:#3b82f6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Track Your Order</a>
          </div>
          <p style="margin-top:30px;font-size:12px;color:#a1a1aa;text-align:center">ToyHype - Cool Toys for the Kid in You</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send order confirmation email:", err);
  }
}

export async function sendAdminNotification(order: Order, items: OrderItem[]) {
  try {
    const itemList = items.map((i) => `${i.product_name} x${i.quantity}`).join(", ");

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Order - ${order.order_number} - Rs ${Math.round(order.total_amount / 100)}`,
      html: `
        <div style="font-family:sans-serif;padding:20px">
          <h2>New ToyHype Order 🎯</h2>
          <p><strong>Order:</strong> ${order.order_number}</p>
          <p><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</p>
          <p><strong>Phone:</strong> ${order.customer_phone}</p>
          <p><strong>Items:</strong> ${itemList}</p>
          <p><strong>Total:</strong> Rs ${Math.round(order.total_amount / 100)}</p>
          <p><strong>Address:</strong> ${JSON.stringify(order.shipping_address)}</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send admin notification:", err);
  }
}

export async function sendPaymentReminder(order: Order) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Complete Your Payment - ${order.order_number}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <div style="text-align:center;margin-bottom:30px">
            <h1 style="color:#3b82f6;margin:0">ToyHype</h1>
          </div>
          <h2 style="color:#18181b">Your Order is Waiting! ⏳</h2>
          <p style="color:#52525b">Hi ${order.customer_name}, looks like your payment for order <strong>${order.order_number}</strong> wasn't completed.</p>
          <div style="background:#fef3c7;padding:16px;border-radius:12px;margin:20px 0;border:1px solid #fbbf24">
            <p style="margin:0;font-size:14px;color:#92400e">Your toys are still in the cart! Complete the payment to grab them before they're gone.</p>
          </div>
          <div style="background:#f5f5f5;padding:16px;border-radius:12px;margin:20px 0">
            <p style="margin:0;font-size:14px;color:#52525b">Order Total</p>
            <p style="margin:4px 0 0;font-weight:bold;font-size:24px;color:#18181b">Rs ${Math.round(order.total_amount / 100)}</p>
          </div>
          <div style="text-align:center;margin:30px 0">
            <a href="${BASE_URL}/products" style="background:#3b82f6;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold">Shop Again</a>
          </div>
          <p style="color:#52525b;font-size:14px">Need help? Reach out on WhatsApp at <strong>+91 8839081997</strong> or DM us on <a href="https://instagram.com/dhandhaonground" style="color:#3b82f6">@dhandhaonground</a>.</p>
          <p style="margin-top:30px;font-size:12px;color:#a1a1aa;text-align:center">ToyHype - Cool Toys for the Kid in You</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send payment reminder:", err);
  }
}

export async function sendOrderShipped(
  order: Order,
  trackingNumber: string,
  trackingUrl?: string
) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Order Shipped - ${order.order_number}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <div style="text-align:center;margin-bottom:30px">
            <h1 style="color:#3b82f6;margin:0">ToyHype</h1>
          </div>
          <h2 style="color:#18181b">Your Order is On Its Way! 🚚</h2>
          <p style="color:#52525b">Hi ${order.customer_name}, great news! Your order has been shipped.</p>
          <div style="background:#f5f5f5;padding:16px;border-radius:12px;margin:20px 0">
            <p style="margin:0;font-size:14px;color:#52525b">Tracking Number</p>
            <p style="margin:4px 0 0;font-weight:bold;font-size:18px">${trackingNumber}</p>
          </div>
          ${trackingUrl ? `<div style="text-align:center"><a href="${trackingUrl}" style="background:#3b82f6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Track Shipment</a></div>` : ""}
          <p style="margin-top:30px;font-size:12px;color:#a1a1aa;text-align:center">ToyHype - Cool Toys for the Kid in You</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send shipping email:", err);
  }
}
