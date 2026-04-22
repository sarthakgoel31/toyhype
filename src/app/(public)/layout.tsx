import { CartProvider } from "@/components/cart/cart-provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
