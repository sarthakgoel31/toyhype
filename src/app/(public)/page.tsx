import { createPublicClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { FeaturedProducts } from "@/components/home/featured-products";
import { ValueProps } from "@/components/home/value-props";
import { TrustBanner } from "@/components/home/trust-banner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import type { Product } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createPublicClient();

  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <FeaturedProducts products={(featuredProducts || []) as Product[]} />
        <TrustBanner />
        <ValueProps />
      </main>
      <Footer />
    </>
  );
}
