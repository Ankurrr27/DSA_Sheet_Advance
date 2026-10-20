import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

const schema = z.object({ email: z.string().email().transform((value) => value.trim().toLowerCase()), code: z.string().regex(/^\d{6}$/) });
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

export async function POST(request: Request) {
  try {
    const { email, code } = schema.parse(await request.json());
    const record = await prisma.adminLoginCode.findFirst({ where: { email }, orderBy: { createdAt: "desc" } });
    if (!record || record.expiresAt <= new Date() || record.codeHash !== hash(code)) return NextResponse.json({ error: "That code is invalid or expired." }, { status: 400 });
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return NextResponse.json({ error: "That email is not approved for admin access." }, { status: 403 });
    await prisma.adminLoginCode.delete({ where: { id: record.id } });
    const user = await prisma.user.upsert({ where: { email }, update: {}, create: { email, name: email.split("@")[0] } });
    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Enter a valid email and six-digit code." }, { status: 400 });
    console.error("Failed to verify admin login code", error);
    return NextResponse.json({ error: "Could not verify the login code." }, { status: 500 });
  }
}
