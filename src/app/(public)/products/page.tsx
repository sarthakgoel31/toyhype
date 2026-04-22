import { createPublicClient } from "@/lib/supabase/server";
import { ProductsClient } from "./products-client";
import type { Product, Category } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const supabase = createPublicClient();

  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order"),
  ]);

  const products = (productsRes.data || []) as Product[];
  const categories = (categoriesRes.data || []) as Category[];

  return <ProductsClient products={products} categories={categories} />;
}
