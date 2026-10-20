import { NextResponse } from "next/server";
import { getSessionUser, publicUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "You must be logged in." }, { status: 401 });

  try {
    const body = await request.json() as { name?: unknown; image?: unknown };
    const name = typeof body.name === "string" ? body.name.trim() : user.name;
    const image = typeof body.image === "string" ? body.image.trim() : user.image;

    if (name.length < 2 || name.length > 60) {
      return NextResponse.json({ error: "Name must be between 2 and 60 characters." }, { status: 400 });
    }
    if (image && !/^https?:\/\/[^\s]+$/i.test(image)) {
      return NextResponse.json({ error: "Profile image must be a valid http(s) URL." }, { status: 400 });
    }

    const updated = await prisma.user.update({ where: { id: user.id }, data: { name, image: image || null } });
    return NextResponse.json({ user: await publicUser(updated) });
  } catch (error) {
    console.error(`Profile update failed: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: "Unable to update your profile right now." }, { status: 500 });
  }
}
