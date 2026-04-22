"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/components/cart/cart-provider";
import { formatPrice, getShippingFee } from "@/lib/order-utils";
import { cn } from "@/lib/utils";
import { ArrowLeft, Lock, Banknote, CreditCard } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type PaymentMethod = "online" | "cod";

export default function CheckoutPage() {
  const { items, subtotal, itemCount, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online");
  const shippingFee = getShippingFee(subtotal);
  const codFee = paymentMethod === "cod" ? 4900 : 0; // Rs 49 COD charge
  const total = subtotal + shippingFee + codFee;

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const createOrder = async () => {
    const orderRes = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        customer: {
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          customer_phone: form.customer_phone,
          shipping_address: {
            line1: form.line1,
            line2: form.line2 || undefined,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
        },
        payment_method: paymentMethod,
      }),
    });

    if (!orderRes.ok) {
      const err = await orderRes.json();
      throw new Error(err.error || "Failed to create order");
    }

    return await orderRes.json();
  };

  const handleCOD = async () => {
    setLoading(true);
    try {
      const { orderId } = await createOrder();
      clearCart();
      router.push(`/order/${orderId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async () => {
    setLoading(true);
    try {
      const { orderId, totalAmount } = await createOrder();

      const rzpRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, amount: totalAmount }),
      });

      if (!rzpRes.ok) throw new Error("Failed to create payment");
      const { razorpayOrderId } = await rzpRes.json();

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: totalAmount,
          currency: "INR",
          name: "ToyHype",
          description: `Order for ${itemCount} item${itemCount > 1 ? "s" : ""}`,
          order_id: razorpayOrderId,
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const verifyRes = await fetch("/api/razorpay/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              if (verifyRes.ok) {
                clearCart();
                router.push(`/order/${orderId}`);
              } else {
                toast.error("Payment verification failed. Contact support.");
              }
            } catch {
              toast.error("Payment verification failed.");
            }
          },
          prefill: {
            name: form.customer_name,
            email: form.customer_email,
            contact: form.customer_phone,
          },
          theme: { color: "#3b82f6" },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (paymentMethod === "cod") {
      await handleCOD();
    } else {
      await handleOnlinePayment();
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-[var(--text-muted)] mb-4">Your cart is empty</p>
            <Link href="/products" className={cn(buttonVariants())}>Continue Shopping</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>

          <h1 className="text-2xl font-bold font-heading mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-5 gap-8">
              {/* Form */}
              <div className="md:col-span-3 space-y-6">
                {/* Customer Info */}
                <div className="bg-white rounded-2xl border border-[var(--border-subtle)] p-6 space-y-4">
                  <h3 className="font-semibold">Contact Details</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" required value={form.customer_name} onChange={(e) => update("customer_name", e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" required value={form.customer_phone} onChange={(e) => update("customer_phone", e.target.value)} className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required value={form.customer_email} onChange={(e) => update("customer_email", e.target.value)} className="mt-1" />
                  </div>
                </div>

                {/* Shipping */}
                <div className="bg-white rounded-2xl border border-[var(--border-subtle)] p-6 space-y-4">
                  <h3 className="font-semibold">Shipping Address</h3>
                  <div>
                    <Label htmlFor="line1">Address Line 1</Label>
                    <Input id="line1" required value={form.line1} onChange={(e) => update("line1", e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="line2">Address Line 2 (optional)</Label>
                    <Input id="line2" value={form.line2} onChange={(e) => update("line2", e.target.value)} className="mt-1" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" required value={form.city} onChange={(e) => update("city", e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" required value={form.state} onChange={(e) => update("state", e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input id="pincode" required pattern="[0-9]{6}" value={form.pincode} onChange={(e) => update("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} className="mt-1" />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl border border-[var(--border-subtle)] p-6 space-y-4">
                  <h3 className="font-semibold">Payment Method</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("online")}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                        paymentMethod === "online"
                          ? "border-[var(--accent-blue)] bg-blue-50"
                          : "border-[var(--border-subtle)] hover:border-[var(--text-muted)]"
                      )}
                    >
                      <CreditCard className={cn("w-5 h-5", paymentMethod === "online" ? "text-[var(--accent-blue)]" : "text-[var(--text-muted)]")} />
                      <div>
                        <p className="font-semibold text-sm">Pay Online</p>
                        <p className="text-xs text-[var(--text-muted)]">UPI, Card, Net Banking</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                        paymentMethod === "cod"
                          ? "border-[var(--accent-green)] bg-green-50"
                          : "border-[var(--border-subtle)] hover:border-[var(--text-muted)]"
                      )}
                    >
                      <Banknote className={cn("w-5 h-5", paymentMethod === "cod" ? "text-[var(--accent-green)]" : "text-[var(--text-muted)]")} />
                      <div>
                        <p className="font-semibold text-sm">Cash on Delivery</p>
                        <p className="text-xs text-[var(--text-muted)]">+Rs 49 COD charge</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-2xl border border-[var(--border-subtle)] p-6 space-y-4 sticky top-20">
                  <h3 className="font-semibold">Order Summary</h3>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span className="truncate flex-1">{item.name} x{item.quantity}</span>
                        <span className="ml-2 shrink-0">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[var(--border-subtle)] pt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Shipping</span>
                      <span className={shippingFee === 0 ? "text-[var(--accent-green)]" : ""}>
                        {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
                      </span>
                    </div>
                    {paymentMethod === "cod" && (
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">COD Charge</span>
                        <span>{formatPrice(codFee)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[var(--border-subtle)] pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>

                  <Button type="submit" className="w-full rounded-xl" size="lg" disabled={loading}>
                    {paymentMethod === "online" ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        {loading ? "Processing..." : `Pay ${formatPrice(total)}`}
                      </>
                    ) : (
                      <>
                        <Banknote className="w-4 h-4 mr-2" />
                        {loading ? "Placing Order..." : `Place COD Order — ${formatPrice(total)}`}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-[var(--text-muted)]">
                    {paymentMethod === "online" ? "Secured by Razorpay" : "Pay cash when you receive the product"}
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
