"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/cart/cart-provider";
import { SEED_PRODUCTS } from "@/data/seed";
import { formatPrice } from "@/lib/order-utils";
import { ShoppingCart, Star, Minus, Plus, ArrowLeft, Truck, Shield, Package } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const seedProduct = SEED_PRODUCTS.find((p) => p.slug === slug);

  if (!seedProduct) {
    notFound();
  }

  return <ProductDetail seedProduct={seedProduct} />;
}

function ProductDetail({ seedProduct }: { seedProduct: (typeof SEED_PRODUCTS)[number] }) {
  const { addItem, isInCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const inCart = isInCart(`seed-${SEED_PRODUCTS.indexOf(seedProduct)}`);

  const discount = seedProduct.compare_at_price
    ? Math.round((1 - seedProduct.price / seedProduct.compare_at_price) * 100)
    : 0;

  const handleAdd = () => {
    addItem(
      {
        productId: `seed-${SEED_PRODUCTS.indexOf(seedProduct)}`,
        name: seedProduct.name,
        price: seedProduct.price,
        compareAtPrice: seedProduct.compare_at_price || undefined,
        image: seedProduct.images[0] || "",
        stockQuantity: seedProduct.stock_quantity,
        slug: seedProduct.slug,
      },
      quantity
    );
    toast.success(`${seedProduct.name} added to cart!`);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 pb-28 md:pb-0">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* Breadcrumb */}
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Toys
          </Link>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="aspect-square rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center overflow-hidden relative"
            >
              <span className="text-8xl">🎮</span>
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-[var(--accent-red)] text-white border-0 text-sm px-3 py-1">
                  -{discount}% OFF
                </Badge>
              )}
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-[var(--text-primary)] tracking-tight">
                {seedProduct.name}
              </h1>

              {seedProduct.rating > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(seedProduct.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {seedProduct.rating} ({seedProduct.review_count} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-3xl font-bold text-[var(--text-primary)]">
                  {formatPrice(seedProduct.price)}
                </span>
                {seedProduct.compare_at_price && (
                  <span className="text-lg text-[var(--text-muted)] line-through">
                    {formatPrice(seedProduct.compare_at_price)}
                  </span>
                )}
                {discount > 0 && (
                  <Badge className="bg-green-100 text-green-700 border-0">
                    Save {formatPrice(seedProduct.compare_at_price! - seedProduct.price)}
                  </Badge>
                )}
              </div>

              <p className="mt-5 text-base text-[var(--text-secondary)] leading-relaxed">
                {seedProduct.description}
              </p>

              {/* Specs */}
              <div className="mt-8 grid grid-cols-2 gap-3">
                {Object.entries(seedProduct.specs).map(([key, value]) => (
                  <div key={key} className="bg-[var(--bg-warm)] rounded-xl p-4">
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">{key}</p>
                    <p className="text-sm font-bold mt-1">{value}</p>
                  </div>
                ))}
              </div>

              {/* Quantity + Add to Cart */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[var(--text-secondary)]">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-9 h-9"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-9 h-9"
                      onClick={() => setQuantity(Math.min(seedProduct.stock_quantity, quantity + 1))}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    {seedProduct.stock_quantity} in stock
                  </span>
                </div>

                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    className="w-full text-base rounded-xl"
                    onClick={handleAdd}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {inCart ? "Add More to Cart" : "Add to Cart"}
                  </Button>
                </motion.div>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap gap-5 text-sm text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[var(--accent-green)]" />
                  Free shipping above Rs 999
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[var(--accent-blue)]" />
                  Secure checkout
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[var(--accent-orange)]" />
                  7-day returns
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile sticky add to cart */}
        <div className="fixed bottom-14 left-0 right-0 md:hidden bg-white/95 backdrop-blur border-t border-[var(--border-subtle)] px-4 py-3 z-40">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-lg font-bold">{formatPrice(seedProduct.price)}</p>
            </div>
            <Button className="flex-1 rounded-xl" onClick={handleAdd}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <BottomTabs />
    </>
  );
}
