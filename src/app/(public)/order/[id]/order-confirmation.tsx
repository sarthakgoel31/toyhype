"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/order-utils";
import { CheckCircle, Package, ArrowRight, XCircle, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { toast } from "sonner";
import type { Order, OrderItem } from "@/types/database";

export function OrderConfirmation({
  order,
  items,
}: {
  order: Order;
  items: OrderItem[];
}) {
  const [status, setStatus] = useState(order.status);
  const [cancelling, setCancelling] = useState(false);
  const isCOD = order.payment_status === "cod";
  const canCancel = isCOD && ["CONFIRMED", "PAYMENT_PENDING"].includes(status);
  const isCancelled = status === "CANCELLED";

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, { method: "POST" });
      if (res.ok) {
        setStatus("CANCELLED");
        toast.success("Order cancelled successfully");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to cancel");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setCancelling(false);
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
            >
              {isCancelled ? (
                <XCircle className="w-20 h-20 text-[var(--accent-red)] mx-auto" />
              ) : (
                <CheckCircle className="w-20 h-20 text-[var(--accent-green)] mx-auto" />
              )}
            </motion.div>

            <motion.h1
              className="text-3xl font-bold font-heading mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {isCancelled ? "Order Cancelled" : "Order Confirmed!"}
            </motion.h1>

            <motion.p
              className="text-[var(--text-secondary)] mt-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {isCancelled
                ? "Your order has been cancelled. No charges applied."
                : `Your order has been placed successfully. ${isCOD ? "Pay cash on delivery." : "We'll send a confirmation email shortly."}`}
            </motion.p>
          </div>

          <motion.div
            className="bg-[var(--bg-warm)] rounded-2xl p-6 mt-8 space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <Package className="w-4 h-4" />
                {order.order_number}
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white">
                {ORDER_STATUS_LABELS[status] || status}
              </span>
            </div>

            {/* Items */}
            <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">
                    {item.product_name} x{item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatPrice(item.price_at_purchase * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between font-bold">
              <span>Total</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>

            {isCOD && !isCancelled && (
              <div className="flex items-start gap-2 text-xs text-[var(--text-muted)] bg-green-50 rounded-lg p-3">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-green-600" />
                <span>Cash on Delivery — pay <strong>{formatPrice(order.total_amount)}</strong> when you receive the product.</span>
              </div>
            )}
          </motion.div>

          <motion.div
            className="flex flex-col gap-3 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex gap-3">
              <Link href="/track" className={cn(buttonVariants({ variant: "outline" }), "flex-1 rounded-xl")}>
                Track Order
              </Link>
              <Link href="/products" className={cn(buttonVariants(), "flex-1 rounded-xl")}>
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            {canCancel && (
              <Button
                variant="ghost"
                className="text-[var(--text-muted)] hover:text-[var(--accent-red)]"
                onClick={handleCancel}
                disabled={cancelling}
              >
                <XCircle className="w-4 h-4 mr-1" />
                {cancelling ? "Cancelling..." : "Cancel Order (Free)"}
              </Button>
            )}
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
