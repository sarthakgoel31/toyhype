import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Fetch products error:", err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        price: body.price,
        compare_at_price: body.compare_at_price || null,
        category_id: body.category_id || null,
        images: body.images || [],
        stock_quantity: body.stock_quantity || 0,
        is_active: body.is_active !== false,
        is_featured: body.is_featured || false,
        specs: body.specs || {},
      })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("Create product error:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
