"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/order-utils";
import type { Order, OrderItem, ShippingAddress } from "@/types/database";
import { format } from "date-fns";
import {
  Truck, CheckCircle, Bell, XCircle, ChevronDown, ChevronUp,
  Phone, Mail, MapPin, CreditCard, Banknote, Copy,
  RotateCcw, PackageX, PackageCheck,
} from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  PAYMENT_PENDING: "bg-[var(--status-pending-bg)] text-[var(--status-pending-text)]",
  CONFIRMED: "bg-[var(--status-confirmed-bg)] text-[var(--status-confirmed-text)]",
  SHIPPED: "bg-[var(--status-shipped-bg)] text-[var(--status-shipped-text)]",
  DELIVERED: "bg-[var(--status-delivered-bg)] text-[var(--status-delivered-text)]",
  PAYMENT_FAILED: "bg-[var(--status-cancelled-bg)] text-[var(--status-cancelled-text)]",
  CANCELLED: "bg-[var(--status-cancelled-bg)] text-[var(--status-cancelled-text)]",
  RTO: "bg-orange-100 text-orange-800",
  RETURN_REQUESTED: "bg-purple-100 text-purple-800",
  RETURNED: "bg-gray-100 text-gray-800",
};

type OrderWithItems = Order & { items?: OrderItem[] };

export function AdminOrderList() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        // Auto-expand confirmed orders (need to ship)
        const autoExpand: Record<string, boolean> = {};
        data.forEach((o: OrderWithItems) => {
          if (o.status === "CONFIRMED") autoExpand[o.id] = true;
        });
        setExpanded(autoExpand);
      }
    } catch {}
    setLoading(false);
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
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

  async function sendReminder(orderId: string) {
    setSendingReminder(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/remind`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Payment reminder sent!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to send reminder");
      }
    } catch {
      toast.error("Error sending reminder");
    }
    setSendingReminder(null);
  }

  async function cancelOrder(orderId: string) {
    const reason = prompt("Cancellation reason (optional):");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED", reason: reason || "Cancelled by admin" }),
      });
      if (res.ok) {
        toast.success("Order cancelled");
        fetchOrders();
      } else {
        toast.error("Failed to cancel order");
      }
    } catch {
      toast.error("Error cancelling order");
    }
  }

  function copyAddress(addr: ShippingAddress, name: string, phone: string) {
    const text = `${name}\n${addr.line1}${addr.line2 ? ", " + addr.line2 : ""}\n${addr.city}, ${addr.state} - ${addr.pincode}\nPh: ${phone}`;
    navigator.clipboard.writeText(text);
    toast.success("Address copied!");
  }

  if (loading) return <p className="text-[var(--text-muted)]">Loading orders...</p>;
  if (orders.length === 0) return <p className="text-[var(--text-muted)]">No orders yet.</p>;

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const isExpanded = expanded[order.id];
        const addr = order.shipping_address as ShippingAddress;
        const isCOD = order.payment_status === "cod";

        return (
          <div key={order.id} className="bg-white rounded-xl border border-[var(--border-subtle)] overflow-hidden">
            {/* Header — always visible, clickable */}
            <button
              onClick={() => toggleExpand(order.id)}
              className="w-full p-4 flex items-start justify-between text-left hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm font-medium">{order.order_number}</p>
                  <Badge className={`${statusColors[order.status]} border-0 text-xs`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                  {isCOD && (
                    <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                      COD
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                  {order.customer_name} &middot; {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {format(new Date(order.created_at), "dd MMM yyyy, hh:mm a")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-lg font-bold">{formatPrice(order.total_amount)}</p>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                )}
              </div>
            </button>

            {/* Expanded details */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-4 border-t border-[var(--border-subtle)]">
                {/* Items */}
                <div className="pt-3">
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
                    Items Ordered
                  </p>
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                          {item.product_image ? (
                            <Image
                              src={item.product_image}
                              alt={item.product_name}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm">
                              🎮
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product_name}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            Qty: {item.quantity} x {formatPrice(item.price_at_purchase)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold shrink-0">
                          {formatPrice(item.price_at_purchase * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer + Address side by side */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Customer */}
                  <div className="bg-[var(--bg-warm)] rounded-lg p-3">
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
                      Customer
                    </p>
                    <div className="space-y-1.5 text-sm">
                      <p className="font-medium">{order.customer_name}</p>
                      <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <Phone className="w-3.5 h-3.5" />
                        <a href={`tel:${order.customer_phone}`} className="hover:text-[var(--accent-blue)]">
                          {order.customer_phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate">{order.customer_email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        {isCOD ? (
                          <Banknote className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <CreditCard className="w-3.5 h-3.5" />
                        )}
                        <span>{isCOD ? "Cash on Delivery" : "Online Payment"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-[var(--bg-warm)] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                        Ship To
                      </p>
                      <button
                        onClick={() => copyAddress(addr, order.customer_name, order.customer_phone)}
                        className="text-xs text-[var(--accent-blue)] hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                    <div className="text-sm text-[var(--text-secondary)] space-y-0.5">
                      <div className="flex gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <div>
                          <p>{addr.line1}</p>
                          {addr.line2 && <p>{addr.line2}</p>}
                          <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="bg-[var(--bg-warm)] rounded-lg p-3 text-sm">
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Shipping{isCOD ? " + COD fee" : ""}</span>
                    <span>{order.shipping_fee === 0 ? "FREE" : formatPrice(order.shipping_fee)}</span>
                  </div>
                  <div className="flex justify-between font-bold mt-1 pt-1 border-t border-[var(--border-subtle)]">
                    <span>Total</span>
                    <span>{formatPrice(order.total_amount)}</span>
                  </div>
                </div>

                {/* Actions */}
                {order.status === "PAYMENT_PENDING" && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendReminder(order.id)}
                      disabled={sendingReminder === order.id}
                    >
                      <Bell className="w-4 h-4 mr-1" />
                      {sendingReminder === order.id ? "Sending..." : "Send Reminder"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[var(--accent-red)] border-[var(--accent-red)] hover:bg-red-50"
                      onClick={() => cancelOrder(order.id)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}

                {order.status === "CONFIRMED" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Tracking number (Shiprocket / courier)"
                        className="flex-1"
                        value={trackingInputs[order.id] || ""}
                        onChange={(e) =>
                          setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })
                        }
                      />
                      <Button
                        size="sm"
                        onClick={() =>
                          updateStatus(order.id, "SHIPPED", trackingInputs[order.id])
                        }
                      >
                        <Truck className="w-4 h-4 mr-1" />
                        Ship
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[var(--text-muted)] hover:text-[var(--accent-red)]"
                      onClick={() => cancelOrder(order.id)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Cancel Order
                    </Button>
                  </div>
                )}

                {order.status === "SHIPPED" && (
                  <div className="space-y-2">
                    {order.tracking_number && (
                      <p className="text-xs text-[var(--text-muted)]">
                        Tracking: <span className="font-mono">{order.tracking_number}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => updateStatus(order.id, "DELIVERED")}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Delivered
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-orange-600 border-orange-300 hover:bg-orange-50"
                        onClick={() => updateStatus(order.id, "RTO")}
                      >
                        <PackageX className="w-4 h-4 mr-1" />
                        RTO (Refused)
                      </Button>
                    </div>
                  </div>
                )}

                {order.status === "DELIVERED" && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-purple-600 border-purple-300 hover:bg-purple-50"
                      onClick={() => updateStatus(order.id, "RETURN_REQUESTED")}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Return Requested
                    </Button>
                  </div>
                )}

                {order.status === "RETURN_REQUESTED" && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateStatus(order.id, "RETURNED")}
                    >
                      <PackageCheck className="w-4 h-4 mr-1" />
                      Mark Returned (Received)
                    </Button>
                  </div>
                )}

                {(order.status === "RTO" || order.status === "RETURNED") && order.admin_notes && (
                  <p className="text-xs text-[var(--text-muted)]">
                    Note: {order.admin_notes}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
