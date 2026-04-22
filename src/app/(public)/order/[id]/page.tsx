"use client";

import { use } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
          >
            <CheckCircle className="w-20 h-20 text-[var(--accent-green)] mx-auto" />
          </motion.div>

          <motion.h1
            className="text-3xl font-bold font-heading mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Order Confirmed!
          </motion.h1>

          <motion.p
            className="text-[var(--text-secondary)] mt-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Your order has been placed successfully. We&apos;ll send a confirmation email shortly.
          </motion.p>

          <motion.div
            className="bg-[var(--bg-warm)] rounded-2xl p-6 mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-muted)] mb-2">
              <Package className="w-4 h-4" />
              Order ID
            </div>
            <p className="font-mono text-sm font-medium break-all">{id}</p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link href="/track" className={cn(buttonVariants({ variant: "outline" }), "flex-1 rounded-xl")}>
              Track Order
            </Link>
            <Link href="/products" className={cn(buttonVariants(), "flex-1 rounded-xl")}>
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
