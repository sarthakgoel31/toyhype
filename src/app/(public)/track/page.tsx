"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Search } from "lucide-react";

export default function TrackPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Will be connected to Supabase in Phase 3
    setResult("Order tracking will be available once Supabase is connected.");
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <Package className="w-16 h-16 text-[var(--accent-blue)] mx-auto mb-6" />
          <h1 className="text-2xl font-bold font-heading mb-2">Track Your Order</h1>
          <p className="text-[var(--text-muted)] mb-8">
            Enter your order number or email to check status
          </p>

          <form onSubmit={handleSearch} className="space-y-4 text-left">
            <div>
              <Label htmlFor="track">Order Number or Email</Label>
              <Input
                id="track"
                placeholder="TH-XXXXX or your@email.com"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={!query.trim()}>
              <Search className="w-4 h-4 mr-2" />
              Track Order
            </Button>
          </form>

          {result && (
            <div className="mt-8 p-4 bg-[var(--bg-warm)] rounded-xl text-sm text-[var(--text-secondary)]">
              {result}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BottomTabs />
    </>
  );
}
