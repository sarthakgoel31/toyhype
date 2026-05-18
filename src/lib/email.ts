import nodemailer from "nodemailer";
import type { Order, OrderItem } from "@/types/database";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

if (!process.env.GMAIL_USER) {
  throw new Error("GMAIL_USER env var is required");
}
if (!process.env.ADMIN_EMAIL) {
  throw new Error("ADMIN_EMAIL env var is required");
}
const FROM_EMAIL = `ToyHype <${process.env.GMAIL_USER}>`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

async function sendMail(to: string, subject: string, html: string) {
  try {
    await getTransporter().sendMail({ from: FROM_EMAIL, to, subject, html });
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err);
  }
}

export async function sendOrderConfirmation(order: Order, items: OrderItem[]) {
  const itemRows = items
    .map(
      (i) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.product_name} x${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">Rs ${Math.round((i.price_at_purchase * i.quantity) / 100)}</td></tr>`
    )
    .join("");

  await sendMail(
    order.customer_email,
    `Order Confirmed - ${order.order_number}`,
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="text-align:center;margin-bottom:30px">
        <h1 style="color:#3b82f6;margin:0">ToyHype</h1>
      </div>
      <h2 style="color:#18181b">Order Confirmed!</h2>
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
    `
  );
}

export async function sendAdminNotification(order: Order, items: OrderItem[]) {
  const itemList = items.map((i) => `${i.product_name} x${i.quantity}`).join(", ");

  await sendMail(
    ADMIN_EMAIL,
    `New Order - ${order.order_number} - Rs ${Math.round(order.total_amount / 100)}`,
    `
    <div style="font-family:sans-serif;padding:20px">
      <h2>New ToyHype Order</h2>
      <p><strong>Order:</strong> ${order.order_number}</p>
      <p><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</p>
      <p><strong>Phone:</strong> ${order.customer_phone}</p>
      <p><strong>Items:</strong> ${itemList}</p>
      <p><strong>Total:</strong> Rs ${Math.round(order.total_amount / 100)}</p>
      <p><strong>Address:</strong> ${JSON.stringify(order.shipping_address)}</p>
    </div>
    `
  );
}

export async function sendPaymentReminder(order: Order) {
  await sendMail(
    order.customer_email,
    `Complete Your Payment - ${order.order_number}`,
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="text-align:center;margin-bottom:30px">
        <h1 style="color:#3b82f6;margin:0">ToyHype</h1>
      </div>
      <h2 style="color:#18181b">Your Order is Waiting!</h2>
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
    `
  );
}

export async function sendOrderCancelled(order: Order, reason?: string) {
  const isCOD = order.payment_status === "cod";

  await sendMail(
    order.customer_email,
    `Order Cancelled - ${order.order_number}`,
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="text-align:center;margin-bottom:30px">
        <h1 style="color:#3b82f6;margin:0">ToyHype</h1>
      </div>
      <h2 style="color:#18181b">Order Cancelled</h2>
      <p style="color:#52525b">Hi ${order.customer_name}, your order <strong>${order.order_number}</strong> has been cancelled.</p>
      ${reason ? `<div style="background:#fef2f2;padding:16px;border-radius:12px;margin:20px 0;border:1px solid #fca5a5"><p style="margin:0;font-size:14px;color:#991b1b">Reason: ${reason}</p></div>` : ""}
      ${!isCOD && order.payment_status === "paid" ? `<div style="background:#f0fdf4;padding:16px;border-radius:12px;margin:20px 0;border:1px solid #86efac"><p style="margin:0;font-size:14px;color:#166534">Your refund will be processed within 5-7 business days to your original payment method.</p></div>` : ""}
      <div style="text-align:center;margin:30px 0">
        <a href="${BASE_URL}/products" style="background:#3b82f6;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold">Shop Again</a>
      </div>
      <p style="color:#52525b;font-size:14px">Questions? WhatsApp us at <strong>+91 8839081997</strong> or DM <a href="https://instagram.com/dhandhaonground" style="color:#3b82f6">@dhandhaonground</a>.</p>
      <p style="margin-top:30px;font-size:12px;color:#a1a1aa;text-align:center">ToyHype - Cool Toys for the Kid in You</p>
    </div>
    `
  );
}

export async function sendReturnUpdate(order: Order, status: "RETURN_REQUESTED" | "RETURNED") {
  const isReturned = status === "RETURNED";
  const isCOD = order.payment_status === "cod";

  await sendMail(
    order.customer_email,
    isReturned
      ? `Return Complete - ${order.order_number}`
      : `Return Request Received - ${order.order_number}`,
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="text-align:center;margin-bottom:30px">
        <h1 style="color:#3b82f6;margin:0">ToyHype</h1>
      </div>
      <h2 style="color:#18181b">${isReturned ? "Return Complete" : "Return Request Received"}</h2>
      ${
        isReturned
          ? `<p style="color:#52525b">Hi ${order.customer_name}, we've received your returned item for order <strong>${order.order_number}</strong>.</p>
             <div style="background:#f0fdf4;padding:16px;border-radius:12px;margin:20px 0;border:1px solid #86efac">
               <p style="margin:0;font-size:14px;color:#166534">${isCOD ? "Your refund will be processed via UPI/bank transfer within 3-5 business days. We'll reach out for your payment details." : "Your refund of Rs " + Math.round(order.total_amount / 100) + " will be processed within 5-7 business days to your original payment method."}</p>
             </div>`
          : `<p style="color:#52525b">Hi ${order.customer_name}, we've received your return request for order <strong>${order.order_number}</strong>.</p>
             <div style="background:#eff6ff;padding:16px;border-radius:12px;margin:20px 0;border:1px solid #93c5fd">
               <p style="margin:0;font-size:14px;color:#1e40af"><strong>Next steps:</strong></p>
               <ol style="margin:8px 0 0;padding-left:20px;color:#1e40af;font-size:14px">
                 <li>Pack the product in original packaging</li>
                 <li>Ship it to the address we'll share via WhatsApp/email</li>
                 <li>Once we receive and inspect, your refund will be processed</li>
               </ol>
             </div>`
      }
      <p style="color:#52525b;font-size:14px">Questions? WhatsApp us at <strong>+91 8839081997</strong> or DM <a href="https://instagram.com/dhandhaonground" style="color:#3b82f6">@dhandhaonground</a>.</p>
      <p style="margin-top:30px;font-size:12px;color:#a1a1aa;text-align:center">ToyHype - Cool Toys for the Kid in You</p>
    </div>
    `
  );
}

export async function sendOrderShipped(
  order: Order,
  trackingNumber: string,
  trackingUrl?: string
) {
  await sendMail(
    order.customer_email,
    `Order Shipped - ${order.order_number}`,
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="text-align:center;margin-bottom:30px">
        <h1 style="color:#3b82f6;margin:0">ToyHype</h1>
      </div>
      <h2 style="color:#18181b">Your Order is On Its Way!</h2>
      <p style="color:#52525b">Hi ${order.customer_name}, great news! Your order has been shipped.</p>
      <div style="background:#f5f5f5;padding:16px;border-radius:12px;margin:20px 0">
        <p style="margin:0;font-size:14px;color:#52525b">Tracking Number</p>
        <p style="margin:4px 0 0;font-weight:bold;font-size:18px">${trackingNumber}</p>
      </div>
      ${trackingUrl ? `<div style="text-align:center"><a href="${trackingUrl}" style="background:#3b82f6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Track Shipment</a></div>` : ""}
      <p style="margin-top:30px;font-size:12px;color:#a1a1aa;text-align:center">ToyHype - Cool Toys for the Kid in You</p>
    </div>
    `
  );
}
