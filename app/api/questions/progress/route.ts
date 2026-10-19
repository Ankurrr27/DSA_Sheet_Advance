import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";

const bodySchema = z.object({ questionId: z.string().min(1), solved: z.boolean(), notes: z.string().trim().max(1000).nullable().optional() });

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Please log in to update progress." }, { status: 401 });
    const { questionId, solved, notes } = bodySchema.parse(await request.json());
    const progress = await prisma.questionProgress.upsert({ where: { userId_questionId: { userId: user.id, questionId } }, update: { status: solved ? "SOLVED" : "NOT_STARTED", solvedAt: solved ? new Date() : null, lastAttemptedAt: new Date(), notes: notes === undefined ? undefined : notes || null }, create: { userId: user.id, questionId, status: solved ? "SOLVED" : "NOT_STARTED", solvedAt: solved ? new Date() : null, lastAttemptedAt: new Date(), notes: notes || null } });
    await prisma.activityLog.create({ data: { userId: user.id, questionId, activityType: solved ? "QUESTION_SOLVED" : "QUESTION_UNSOLVED" } });
    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Failed to update progress", error);
    return NextResponse.json({ error: "Could not save completion status." }, { status: 500 });
  }
}
