export function generateOrderNumber(): string {
  const prefix = "TH";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}${random}`;
}

export function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export function getShippingFee(subtotalPaise: number): number {
  // Free shipping above Rs 999
  if (subtotalPaise >= 99900) return 0;
  return 4900; // Rs 49
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PAYMENT_PENDING: "Payment Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  PAYMENT_FAILED: "Payment Failed",
  CANCELLED: "Cancelled",
  RTO: "RTO (Returned)",
  RETURN_REQUESTED: "Return Requested",
  RETURNED: "Returned",
};
