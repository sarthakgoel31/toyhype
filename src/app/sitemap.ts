import { createPublicClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/data/categories";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();

  const { data: products } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("is_active", true);

  const staticPages = [
    { url: `${BASE_URL}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${BASE_URL}/returns`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${BASE_URL}/track`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
  ];

  const categoryPages = CATEGORIES.map((cat) => ({
    url: `${BASE_URL}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const productPages = (products || []).map((p) => ({
    url: `${BASE_URL}/product/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
