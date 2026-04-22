"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { ProductGrid } from "@/components/product/product-grid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEED_PRODUCTS } from "@/data/seed";
import { CATEGORIES } from "@/data/categories";
import type { Product } from "@/types/database";
import { Search, SlidersHorizontal, X } from "lucide-react";

const allProducts: Product[] = SEED_PRODUCTS.map((p, i) => ({
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
  is_featured: p.is_featured || false,
  specs: p.specs as unknown as Record<string, string>,
  rating: p.rating,
  review_count: p.review_count,
  weight_grams: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

type SortOption = "newest" | "price-low" | "price-high" | "rating";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("newest");

  const filtered = useMemo(() => {
    let result = allProducts;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      const catProducts = SEED_PRODUCTS
        .filter((p) => p.category_slug === selectedCategory)
        .map((p) => p.slug);
      result = result.filter((p) => catProducts.includes(p.slug));
    }

    switch (sort) {
      case "price-low":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [search, selectedCategory, sort]);

  return (
    <>
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold font-heading mb-6">All Toys</h1>

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <Input
                placeholder="Search toys..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant={sort === "newest" ? "default" : "outline"}
                size="sm"
                onClick={() => setSort("newest")}
              >
                Newest
              </Button>
              <Button
                variant={sort === "price-low" ? "default" : "outline"}
                size="sm"
                onClick={() => setSort("price-low")}
              >
                Price: Low
              </Button>
              <Button
                variant={sort === "price-high" ? "default" : "outline"}
                size="sm"
                onClick={() => setSort("price-high")}
              >
                Price: High
              </Button>
              <Button
                variant={sort === "rating" ? "default" : "outline"}
                size="sm"
                onClick={() => setSort("rating")}
              >
                Top Rated
              </Button>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {CATEGORIES.map((cat) => (
              <Badge
                key={cat.slug}
                variant={selectedCategory === cat.slug ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)
                }
              >
                {cat.name}
              </Badge>
            ))}
          </div>

          <p className="text-sm text-[var(--text-muted)] mb-4">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          </p>

          <ProductGrid products={filtered} />
        </div>
      </main>
      <Footer />
      <BottomTabs />
    </>
  );
}
