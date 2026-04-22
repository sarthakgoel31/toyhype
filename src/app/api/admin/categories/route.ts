import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Fetch categories error:", err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        display_order: body.display_order || 0,
        is_active: body.is_active !== false,
      })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("Create category error:", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
