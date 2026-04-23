import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Fetch orders error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
