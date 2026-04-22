"use client";

import { motion } from "motion/react";
import { ShoppingCart, PackageCheck, Smile } from "lucide-react";

const steps = [
  {
    icon: ShoppingCart,
    title: "Pick Your Toy",
    description: "Browse our collection, add to cart, and checkout with UPI, card, or COD.",
    color: "from-blue-100 to-blue-200",
    iconColor: "text-blue-600",
    step: "1",
  },
  {
    icon: PackageCheck,
    title: "Get It Delivered",
    description: "Order confirmed instantly. We ship fast so you don't have to wait long.",
    color: "from-green-100 to-green-200",
    iconColor: "text-green-600",
    step: "2",
  },
  {
    icon: Smile,
    title: "Play & Enjoy",
    description: "Unbox, play, and relive the joy. Not happy? 7-day easy returns.",
    color: "from-amber-100 to-amber-200",
    iconColor: "text-amber-600",
    step: "3",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-2xl md:text-3xl font-bold font-heading text-center mb-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          How It Works
        </motion.h2>
        <motion.p
          className="text-center text-[var(--text-muted)] mb-10 text-sm md:text-base"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
        >
          3 simple steps to your next favorite toy
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={`relative rounded-2xl bg-gradient-to-br ${step.color} p-8 text-center`}
            >
              {/* Step number */}
              <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/60 flex items-center justify-center text-xs font-bold text-[var(--text-secondary)]">
                {step.step}
              </div>

              <div className={`w-14 h-14 rounded-2xl bg-white/70 flex items-center justify-center mx-auto mb-5 ${step.iconColor}`}>
                <step.icon className="w-7 h-7" />
              </div>

              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
