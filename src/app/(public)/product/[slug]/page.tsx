import { createPublicClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./product-detail";
import type { Product } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  return <ProductDetailClient product={product as Product} />;
}
