"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Plane, Lightbulb, Hand, Cpu, Dice5, Puzzle, Trophy, Trees } from "lucide-react";
import { CATEGORIES } from "@/data/categories";

const iconMap: Record<string, React.ElementType> = {
  Plane, Lightbulb, Hand, Cpu, Dice5, Puzzle, Trophy, Trees,
};

const categoryColors = [
  "from-blue-100 to-blue-200",
  "from-amber-100 to-amber-200",
  "from-pink-100 to-pink-200",
  "from-green-100 to-green-200",
  "from-purple-100 to-purple-200",
  "from-orange-100 to-orange-200",
  "from-red-100 to-red-200",
  "from-teal-100 to-teal-200",
];

export function CategoryGrid() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-2xl md:text-3xl font-bold font-heading text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Shop by Category
        </motion.h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => {
            const Icon = iconMap[cat.icon] || Puzzle;
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.05, y: -4 }}
              >
                <Link
                  href={`/category/${cat.slug}`}
                  className={`flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br ${categoryColors[i]} transition-shadow hover:shadow-lg`}
                >
                  <Icon className="w-8 h-8 text-[var(--text-primary)]" />
                  <span className="text-sm font-semibold text-[var(--text-primary)] text-center">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
