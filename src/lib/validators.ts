import { z } from "zod/v4";

export const adminPinSchema = z.object({
  pin: z.string().min(4).max(20),
});

export const checkoutSchema = z.object({
  customer_name: z.string().min(2, "Name is required"),
  customer_email: z.email("Valid email required"),
  customer_phone: z.string().min(10, "Valid phone number required"),
  shipping_address: z.object({
    line1: z.string().min(5, "Address is required"),
    line2: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z.string().regex(/^\d{6}$/, "Valid 6-digit pincode required"),
  }),
});

export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
});

export const createOrderSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Cart cannot be empty"),
  customer: checkoutSchema,
});
