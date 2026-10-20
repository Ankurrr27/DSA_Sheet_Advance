import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const user = await getAdminSession();
  if (!user) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });

  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    include: { subtopics: { orderBy: { order: "asc" }, include: { questions: { orderBy: [{ sheetNumber: "asc" }, { order: "asc" }] } } } },
  });
  return NextResponse.json({ topics });
}
