"use client";

import { motion } from "motion/react";
import { ProductCard } from "@/components/product/product-card";
import { SEED_PRODUCTS } from "@/data/seed";
import type { Product } from "@/types/database";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

// Use seed data until Supabase is connected
const featuredProducts: Product[] = SEED_PRODUCTS
  .filter((p) => p.is_featured)
  .map((p, i) => ({
    id: `seed-${i}`,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    compare_at_price: p.compare_at_price || null,
    category_id: null,
    images: p.images,
    stock_quantity: p.stock_quantity,
    is_active: true,
    is_featured: true,
    specs: p.specs as unknown as Record<string, string>,
    rating: p.rating,
    review_count: p.review_count,
    weight_grams: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

export function FeaturedProducts() {
  return (
    <section className="py-16 px-4 bg-[var(--bg-warm)]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-bold font-heading">
            Featured Toys
          </h2>
          <Link href="/products" className={cn(buttonVariants({ variant: "ghost" }), "text-[var(--accent-blue)]")}>
              View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 8).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
