"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-provider";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { formatPrice, getShippingFee } from "@/lib/order-utils";
import { ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { items, subtotal, itemCount, clearCart } = useCart();
  const shippingFee = getShippingFee(subtotal);
  const total = subtotal + shippingFee;

  return (
    <>
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold font-heading mb-6">
            Shopping Cart ({itemCount})
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-20 h-20 mx-auto text-[var(--text-muted)] mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-[var(--text-muted)] mb-6">
                Looks like you haven&apos;t added any toys yet!
              </p>
              <Link href="/products" className={cn(buttonVariants({ size: "lg" }), "rounded-xl")}>
                  Start Shopping
                  <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                {items.map((item) => (
                  <CartItemRow key={item.productId} item={item} />
                ))}
              </div>

              <button
                onClick={clearCart}
                className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors"
              >
                Clear Cart
              </button>

              {/* Summary */}
              <div className="bg-white rounded-2xl border border-[var(--border-subtle)] p-6 space-y-4">
                <h3 className="font-semibold">Order Summary</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Subtotal ({itemCount} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Shipping</span>
                    <span className={shippingFee === 0 ? "text-[var(--accent-green)] font-medium" : ""}>
                      {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
                    </span>
                  </div>
                  {shippingFee > 0 && (
                    <p className="text-xs text-[var(--accent-green)]">
                      Add {formatPrice(99900 - subtotal)} more for free shipping!
                    </p>
                  )}
                </div>

                <div className="border-t border-[var(--border-subtle)] pt-3 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }), "w-full rounded-xl")}>
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BottomTabs />
    </>
  );
}
