import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser, publicUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "You must be logged in." }, { status: 401 });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || (!uploadPreset && (!apiKey || !apiSecret))) return NextResponse.json({ error: "Cloudinary is not configured." }, { status: 503 });

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image first." }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files are supported." }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Image must be smaller than 5 MB." }, { status: 400 });

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = "dsa-track/avatars";
    const upload = new FormData();
    upload.append("file", file);
    if (uploadPreset) {
      // Unsigned presets are intended for direct uploads and do not require
      // exposing or signing with the API secret.
      upload.append("upload_preset", uploadPreset);
      upload.append("folder", folder);
    } else {
      const signature = createHmac("sha1", apiSecret!).update(`folder=${folder}&timestamp=${timestamp}`).digest("hex");
      upload.append("api_key", apiKey!);
      upload.append("timestamp", timestamp);
      upload.append("folder", folder);
      upload.append("signature", signature);
    }

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: upload });
    const result = await response.json() as { secure_url?: string; error?: { message?: string } };
    if (!response.ok || !result.secure_url) throw new Error(result.error?.message || "Cloudinary upload failed");

    const updated = await prisma.user.update({ where: { id: user.id }, data: { image: result.secure_url } });
    return NextResponse.json({ user: publicUser(updated) });
  } catch (error) {
    console.error(`Profile image upload failed: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: "Unable to upload that image right now." }, { status: 500 });
  }
}
