import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOrderSchema } from "@/lib/validators";
import { generateOrderNumber, getShippingFee } from "@/lib/order-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = createOrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid order data", details: result.error.issues },
        { status: 400 }
      );
    }

    const { items, customer } = result.data;
    const supabase = createAdminClient();

    // Fetch product prices server-side to prevent tampering
    const productIds = items.map((i) => i.productId);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, images, stock_quantity, is_active")
      .in("id", productIds);

    if (productsError || !products) {
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }

    // Validate all products exist and are active
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || !product.is_active) {
        return NextResponse.json(
          { error: `Product not available: ${item.productId}` },
          { status: 400 }
        );
      }
      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for ${product.name}. Available: ${product.stock_quantity}` },
          { status: 400 }
        );
      }
    }

    // Calculate totals server-side
    const subtotal = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return sum + product.price * item.quantity;
    }, 0);

    const shippingFee = getShippingFee(subtotal);
    const totalAmount = subtotal + shippingFee;
    const orderNumber = generateOrderNumber();

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: customer.customer_name,
        customer_email: customer.customer_email,
        customer_phone: customer.customer_phone,
        shipping_address: customer.shipping_address,
        subtotal,
        shipping_fee: shippingFee,
        total_amount: totalAmount,
        status: "PAYMENT_PENDING",
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Order creation failed:", orderError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Create order items
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return {
        order_id: order.id,
        product_id: item.productId,
        product_name: product.name,
        product_image: product.images?.[0] || null,
        quantity: item.quantity,
        price_at_purchase: product.price,
      };
    });

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      console.error("Order items creation failed:", itemsError);
      // Clean up the order
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
    }

    // Decrement stock atomically
    for (const item of items) {
      const { data: success } = await supabase.rpc("decrement_stock", {
        p_id: item.productId,
        qty: item.quantity,
      });

      if (!success) {
        console.error(`Failed to decrement stock for ${item.productId}`);
      }
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber,
      totalAmount,
    });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
