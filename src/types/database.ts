export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number; // in paise
  compare_at_price: number | null;
  category_id: string | null;
  images: string[];
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  specs: Record<string, string>;
  rating: number;
  review_count: number;
  weight_grams: number | null;
  created_at: string;
  updated_at: string;
  // Joined
  category?: Category;
}

export type OrderStatus =
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "PAYMENT_FAILED"
  | "CANCELLED"
  | "RTO"
  | "RETURN_REQUESTED"
  | "RETURNED";

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  status: OrderStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  payment_status: string;
  tracking_number: string | null;
  tracking_url: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  // Joined
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price_at_purchase: number; // per unit, in paise
}
