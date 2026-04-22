import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Generate unique filename
    // Support both images and videos
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const isVideoFile = ["mp4", "webm", "mov", "avi"].includes(ext);
    const folder = isVideoFile ? "videos" : "products";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const path = `${folder}/${filename}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(path);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
