import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";

const questionSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1).optional(),
  externalUrl: z.string().url(),
  youtubeUrl: z.string().url().nullable().optional(),
  platform: z.string().trim().min(1).default("LeetCode"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  topicId: z.string().min(1),
  subtopicId: z.string().min(1).nullable().optional(),
  sheetNumber: z.coerce.number().int().nonnegative().default(0),
  label: z.string().trim().max(40).nullable().optional(),
  labelColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
});

export async function GET() {
  try {
    const user = await getSessionUser();
    const topics = await prisma.topic.findMany({
      where: { subtopics: { some: { questions: { some: { isActive: true } } } } },
      orderBy: { order: "asc" },
      include: { subtopics: { where: { questions: { some: { isActive: true } } }, orderBy: { order: "asc" }, include: { questions: { where: { isActive: true }, orderBy: [{ sheetNumber: "asc" }, { order: "asc" }], include: { progress: user ? { where: { userId: user.id }, select: { status: true, notes: true } } : { where: { userId: "__anonymous__" }, select: { status: true, notes: true } } } } } } },
    });
    return NextResponse.json({ topics });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to load questions:", message);
    if (error instanceof Error && error.stack) console.error(error.stack);
    return NextResponse.json({
      error: "Database is unavailable. Check DATABASE_URL and try again.",
      ...(process.env.NODE_ENV !== "production" ? { detail: message } : {}),
    }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    if (!await getSessionUser()) return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
    const input = questionSchema.parse(await request.json());
    const slug = input.slug || `${input.sheetNumber}-${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const question = await prisma.question.create({ data: { ...input, slug, youtubeUrl: input.youtubeUrl || null, label: input.label || null, labelColor: input.labelColor || null, order: input.sheetNumber } });
    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check the question fields." }, { status: 400 });
    console.error("Failed to create question", error);
    return NextResponse.json({ error: "Could not create the question." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!await getSessionUser()) return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
    const body = await request.json();
    const id = z.string().min(1).parse(body.id);
    const input = questionSchema.partial().parse(body.data);
    const question = await prisma.question.update({ where: { id }, data: { ...input, order: input.sheetNumber ?? undefined, youtubeUrl: input.youtubeUrl === "" ? null : input.youtubeUrl, label: input.label === "" ? null : input.label, labelColor: input.labelColor === "" ? null : input.labelColor } });
    return NextResponse.json({ question });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check the question fields." }, { status: 400 });
    console.error("Failed to update question", error);
    return NextResponse.json({ error: "Could not update the question." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!await getSessionUser()) return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
    const id = z.string().min(1).parse((await request.json()).id);
    await prisma.question.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete question", error);
    return NextResponse.json({ error: "Could not delete the question." }, { status: 500 });
  }
}
