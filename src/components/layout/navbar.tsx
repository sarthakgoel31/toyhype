"use client";

import Link from "next/link";
import { ShoppingCart, Search, Menu, X, Package } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";
import { CartSheet } from "@/components/cart/cart-sheet";
import { motion, AnimatePresence } from "motion/react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-blue)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">TH</span>
            </div>
            <span className="text-xl font-bold font-heading text-[var(--text-primary)]">
              ToyHype
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              All Toys
            </Link>
            <Link href="/category/rc-vehicles" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              RC Vehicles
            </Link>
            <Link href="/category/tech-toys" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Tech Toys
            </Link>
            <Link href="/category/board-games" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Board Games
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href="/products">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Search className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/track">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Package className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--accent-red)] text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </motion.span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-[var(--border-subtle)]"
            >
              <nav className="flex flex-col p-4 gap-3 bg-white">
                <Link href="/products" onClick={() => setMobileOpen(false)} className="text-sm py-2 text-[var(--text-secondary)]">
                  All Toys
                </Link>
                <Link href="/category/rc-vehicles" onClick={() => setMobileOpen(false)} className="text-sm py-2 text-[var(--text-secondary)]">
                  RC Vehicles
                </Link>
                <Link href="/category/tech-toys" onClick={() => setMobileOpen(false)} className="text-sm py-2 text-[var(--text-secondary)]">
                  Tech Toys
                </Link>
                <Link href="/category/board-games" onClick={() => setMobileOpen(false)} className="text-sm py-2 text-[var(--text-secondary)]">
                  Board Games
                </Link>
                <Link href="/track" onClick={() => setMobileOpen(false)} className="text-sm py-2 text-[var(--text-secondary)]">
                  Track Order
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
