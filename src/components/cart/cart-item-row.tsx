"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/components/cart/cart-provider";
import { formatPrice } from "@/lib/order-utils";

export function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-4 p-4 bg-[var(--bg-warm)] rounded-xl">
      <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            width={64}
            height={64}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl">
            🎮
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold truncate">{item.name}</h4>
        <p className="text-sm font-bold text-[var(--accent-blue)] mt-1">
          {formatPrice(item.price)}
        </p>

        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="outline"
            size="icon"
            className="w-7 h-7"
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="w-7 h-7"
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            disabled={item.quantity >= item.stockQuantity}
          >
            <Plus className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 ml-auto text-[var(--text-muted)] hover:text-[var(--accent-red)]"
            onClick={() => removeItem(item.productId)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
