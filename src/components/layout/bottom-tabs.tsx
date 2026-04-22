"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, Package } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { motion } from "motion/react";

const tabs = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/products", icon: Search, label: "Browse" },
  { href: "/cart", icon: ShoppingCart, label: "Cart" },
  { href: "/track", icon: Package, label: "Track" },
];

export function BottomTabs() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 backdrop-blur-lg border-t border-[var(--border-subtle)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 relative ${
                isActive ? "text-[var(--accent-blue)]" : "text-[var(--text-muted)]"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {label === "Cart" && itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2 w-4 h-4 bg-[var(--accent-red)] text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {itemCount > 9 ? "9+" : itemCount}
                  </motion.span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
