import { CartProvider } from "@/components/cart/cart-provider";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      {children}
      <WhatsAppButton />
    </CartProvider>
  );
}
