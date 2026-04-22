"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { ProductGrid } from "@/components/product/product-grid";
import { SEED_PRODUCTS } from "@/data/seed";
import { CATEGORIES } from "@/data/categories";
import type { Product } from "@/types/database";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const category = CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const products: Product[] = SEED_PRODUCTS
    .filter((p) => p.category_slug === slug)
    .map((p, i) => ({
      id: `seed-cat-${slug}-${i}`,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      compare_at_price: p.compare_at_price || null,
      category_id: null,
      images: p.images,
      stock_quantity: p.stock_quantity,
      is_active: true,
      is_featured: p.is_featured || false,
      specs: p.specs as unknown as Record<string, string>,
      rating: p.rating,
      review_count: p.review_count,
      weight_grams: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

  return (
    <>
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            All Toys
          </Link>

          <h1 className="text-3xl font-bold font-heading mb-2">{category.name}</h1>
          <p className="text-[var(--text-secondary)] mb-8">{category.description}</p>

          <ProductGrid products={products} />
        </div>
      </main>
      <Footer />
      <BottomTabs />
    </>
  );
}
