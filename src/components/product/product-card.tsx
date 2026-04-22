"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/lib/order-utils";
import type { Product } from "@/types/database";
import { toast } from "sonner";

function isVideo(url: string): boolean {
  const lower = url.toLowerCase();
  return [".mp4", ".webm", ".mov", ".avi"].some((ext) => lower.includes(ext));
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem, isInCart } = useCart();
  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;
  const inCart = isInCart(product.id);
  // Use first image (skip videos) for card thumbnail
  const cardImage = product.images.find((u) => !isVideo(u)) || "";

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      compareAtPrice: product.compare_at_price || undefined,
      image: cardImage,
      stockQuantity: product.stock_quantity,
      slug: product.slug,
    });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Link
        href={`/product/${product.slug}`}
        className="group block bg-white rounded-2xl overflow-hidden border border-[var(--border-subtle)] hover:shadow-xl transition-shadow"
      >
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
          {cardImage ? (
            <Image
              src={cardImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              🎮
            </div>
          )}
          {discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-[var(--accent-red)] text-white border-0">
              -{discount}%
            </Badge>
          )}
          {product.stock_quantity < 5 && product.stock_quantity > 0 && (
            <Badge variant="outline" className="absolute top-3 right-3 bg-white/90 text-[var(--accent-orange)] border-[var(--accent-orange)]">
              Few Left
            </Badge>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-[var(--text-primary)] line-clamp-1 group-hover:text-[var(--accent-blue)] transition-colors">
            {product.name}
          </h3>

          {product.rating > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                {product.rating} ({product.review_count})
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-[var(--text-primary)]">
                {formatPrice(product.price)}
              </span>
              {product.compare_at_price && (
                <span className="text-sm text-[var(--text-muted)] line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>
            <Button
              size="icon"
              variant={inCart ? "default" : "outline"}
              className="w-9 h-9 rounded-xl shrink-0"
              onClick={handleAdd}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
