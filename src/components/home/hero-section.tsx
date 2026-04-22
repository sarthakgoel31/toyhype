"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowRight, Rocket, Gamepad2, Puzzle } from "lucide-react";

const floatingIcons = [
  { Icon: Rocket, className: "top-[15%] left-[10%] text-[var(--accent-blue)]", delay: 0 },
  { Icon: Gamepad2, className: "top-[20%] right-[15%] text-[var(--accent-red)]", delay: 0.5 },
  { Icon: Puzzle, className: "bottom-[25%] left-[20%] text-[var(--accent-orange)]", delay: 1 },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white py-20 md:py-32">
      {/* Floating icons */}
      {floatingIcons.map(({ Icon, className, delay }, i) => (
        <motion.div
          key={i}
          className={`absolute hidden md:block ${className}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 0.2,
            scale: 1,
            y: [0, -15, 0],
          }}
          transition={{
            opacity: { delay: delay + 0.5, duration: 0.5 },
            scale: { delay: delay + 0.5, duration: 0.5 },
            y: { delay: delay + 1, duration: 3, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <Icon className="w-16 h-16" />
        </motion.div>
      ))}

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-[var(--accent-blue)] text-sm font-medium rounded-full mb-6">
            Toys for Adults Who Never Grew Up
          </span>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold font-heading text-[var(--text-primary)] leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          Cool Toys for the{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)]">
            Kid in You
          </span>
        </motion.h1>

        <motion.p
          className="mt-6 text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          RC helicopters, desk gadgets, brain teasers, and collectibles that make adulting worth it.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <Link href="/products" className={cn(buttonVariants({ size: "lg" }), "text-base px-8 rounded-full")}>
              Shop All Toys
              <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link href="/category/rc-vehicles" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "text-base px-8 rounded-full")}>
            Explore RC Vehicles
          </Link>
        </motion.div>

        <motion.div
          className="mt-12 flex items-center justify-center gap-8 text-sm text-[var(--text-muted)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span>Free Shipping above Rs 999</span>
          <span className="hidden sm:inline">|</span>
          <span>Secure Payments</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">25+ Products</span>
        </motion.div>
      </div>
    </section>
  );
}
