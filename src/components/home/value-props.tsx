"use client";

import { motion } from "motion/react";
import { Truck, Shield, RotateCcw, Headphones } from "lucide-react";

const props = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders above Rs 999",
    color: "text-[var(--accent-blue)]",
    bg: "bg-blue-50",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Razorpay protected",
    color: "text-[var(--accent-green)]",
    bg: "bg-green-50",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "7-day return policy",
    color: "text-[var(--accent-orange)]",
    bg: "bg-orange-50",
  },
  {
    icon: Headphones,
    title: "Quick Support",
    description: "Via Instagram DM",
    color: "text-[var(--accent-purple)]",
    bg: "bg-purple-50",
  },
];

export function ValueProps() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {props.map((prop, i) => (
            <motion.div
              key={prop.title}
              className="flex flex-col items-center text-center gap-3 p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={`w-14 h-14 rounded-xl ${prop.bg} flex items-center justify-center`}>
                <prop.icon className={`w-7 h-7 ${prop.color}`} />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)]">{prop.title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{prop.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
