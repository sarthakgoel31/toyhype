"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/lib/order-utils";
import { ShoppingCart, Minus, Plus, ArrowLeft, Truck, Shield, Package, Play } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Product } from "@/types/database";

function isVideo(url: string): boolean {
  const lower = url.toLowerCase();
  return [".mp4", ".webm", ".mov", ".avi"].some((ext) => lower.includes(ext));
}

export function ProductDetailClient({ product }: { product: Product }) {
  const { addItem, isInCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState(0);
  const inCart = isInCart(product.id);

  const media = product.images || [];
  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  const handleAdd = () => {
    const firstImage = media.find((u) => !isVideo(u)) || "";
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        compareAtPrice: product.compare_at_price || undefined,
        image: firstImage,
        stockQuantity: product.stock_quantity,
        slug: product.slug,
      },
      quantity
    );
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 pb-28 md:pb-0">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Toys
          </Link>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            {/* Media Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              {/* Main display */}
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden relative">
                {media.length > 0 ? (
                  isVideo(media[selectedMedia]) ? (
                    <video
                      src={media[selectedMedia]}
                      controls
                      playsInline
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <Image
                      src={media[selectedMedia]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">
                    🎮
                  </div>
                )}
                {discount > 0 && (
                  <Badge className="absolute top-4 left-4 bg-[var(--accent-red)] text-white border-0 text-sm px-3 py-1">
                    -{discount}% OFF
                  </Badge>
                )}
              </div>

              {/* Thumbnails */}
              {media.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {media.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedMedia(i)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        i === selectedMedia
                          ? "border-[var(--accent-blue)] ring-2 ring-[var(--accent-blue)]/20"
                          : "border-transparent hover:border-[var(--text-muted)]"
                      }`}
                    >
                      {isVideo(url) ? (
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                          <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                      ) : (
                        <Image
                          src={url}
                          alt={`${product.name} ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-[var(--text-primary)] tracking-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-3xl font-bold text-[var(--text-primary)]">
                  {formatPrice(product.price)}
                </span>
                {product.compare_at_price && (
                  <span className="text-lg text-[var(--text-muted)] line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                )}
                {discount > 0 && (
                  <Badge className="bg-green-100 text-green-700 border-0">
                    Save {formatPrice(product.compare_at_price! - product.price)}
                  </Badge>
                )}
              </div>

              {product.description && (
                <p className="mt-5 text-base text-[var(--text-secondary)] leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Specs */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="mt-8 grid grid-cols-2 gap-3">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="bg-[var(--bg-warm)] rounded-xl p-4">
                      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
                        {key}
                      </p>
                      <p className="text-sm font-bold mt-1">{value}</p>
                    </div>
                  ))}
                </div>
              )}

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
                      onClick={() =>
                        setQuantity(Math.min(product.stock_quantity, quantity + 1))
                      }
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    {product.stock_quantity} in stock
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
              <p className="text-lg font-bold">{formatPrice(product.price)}</p>
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
