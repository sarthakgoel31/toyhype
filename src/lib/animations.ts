export const springBouncy = { type: "spring" as const, stiffness: 400, damping: 17 };
export const springGentle = { type: "spring" as const, stiffness: 200, damping: 20 };

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4 },
};

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const scaleOnHover = {
  whileHover: { scale: 1.03, y: -4 },
  transition: springBouncy,
};

export const tapShrink = {
  whileTap: { scale: 0.95 },
};

export const pulseOnChange = {
  animate: { scale: [1, 1.2, 1] },
  transition: { duration: 0.3 },
};
