import { createPublicClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { ProductGrid } from "@/components/product/product-grid";
import type { Product, Category } from "@/types/database";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createPublicClient();

  // Fetch category by slug
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!category) notFound();

  // Fetch products in this category
  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("category_id", (category as Category).id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

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

          <h1 className="text-3xl font-bold font-heading mb-2">
            {(category as Category).name}
          </h1>
          <p className="text-[var(--text-secondary)] mb-8">
            {(category as Category).description}
          </p>

          <ProductGrid products={(products || []) as Product[]} />
        </div>
      </main>
      <Footer />
      <BottomTabs />
    </>
  );
}
