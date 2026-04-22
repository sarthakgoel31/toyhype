"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/order-utils";
import type { Order } from "@/types/database";
import { format } from "date-fns";
import { Package, Truck, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  PAYMENT_PENDING: "bg-[var(--status-pending-bg)] text-[var(--status-pending-text)]",
  CONFIRMED: "bg-[var(--status-confirmed-bg)] text-[var(--status-confirmed-text)]",
  SHIPPED: "bg-[var(--status-shipped-bg)] text-[var(--status-shipped-text)]",
  DELIVERED: "bg-[var(--status-delivered-bg)] text-[var(--status-delivered-text)]",
  PAYMENT_FAILED: "bg-[var(--status-cancelled-bg)] text-[var(--status-cancelled-text)]",
  CANCELLED: "bg-[var(--status-cancelled-bg)] text-[var(--status-cancelled-text)]",
};

export function AdminOrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch {}
    setLoading(false);
  }

  async function updateStatus(orderId: string, status: string, trackingNumber?: string) {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, tracking_number: trackingNumber }),
      });

      if (res.ok) {
        toast.success(`Order updated to ${ORDER_STATUS_LABELS[status]}`);
        fetchOrders();
      } else {
        toast.error("Failed to update order");
      }
    } catch {
      toast.error("Error updating order");
    }
  }

  if (loading) return <p className="text-[var(--text-muted)]">Loading orders...</p>;
  if (orders.length === 0) return <p className="text-[var(--text-muted)]">No orders yet.</p>;

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-xl border border-[var(--border-subtle)] p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-sm font-medium">{order.order_number}</p>
              <p className="text-sm text-[var(--text-secondary)]">
                {order.customer_name} &middot; {order.customer_email}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {format(new Date(order.created_at), "dd MMM yyyy, hh:mm a")}
              </p>
            </div>
            <div className="text-right">
              <Badge className={`${statusColors[order.status]} border-0`}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
              <p className="text-lg font-bold mt-1">{formatPrice(order.total_amount)}</p>
            </div>
          </div>

          {/* Actions */}
          {order.status === "CONFIRMED" && (
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <Input
                placeholder="Tracking number"
                className="flex-1"
                value={trackingInputs[order.id] || ""}
                onChange={(e) => setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })}
              />
              <Button
                size="sm"
                onClick={() => updateStatus(order.id, "SHIPPED", trackingInputs[order.id])}
              >
                <Truck className="w-4 h-4 mr-1" />
                Ship
              </Button>
            </div>
          )}

          {order.status === "SHIPPED" && (
            <div className="pt-2 border-t border-[var(--border-subtle)]">
              {order.tracking_number && (
                <p className="text-xs text-[var(--text-muted)] mb-2">
                  Tracking: {order.tracking_number}
                </p>
              )}
              <Button size="sm" onClick={() => updateStatus(order.id, "DELIVERED")}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark Delivered
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
