import { createHash, randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { escapeHtml, sendEmail } from "@/lib/mail";

const schema = z.object({ email: z.string().email().transform((value) => value.trim().toLowerCase()) });
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

export async function POST(request: Request) {
  try {
    const { email } = schema.parse(await request.json());
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return NextResponse.json({ error: "That email is not approved for admin access." }, { status: 403 });
    const recent = await prisma.adminLoginCode.findFirst({ where: { email, createdAt: { gt: new Date(Date.now() - 60_000) } } });
    if (recent) return NextResponse.json({ error: "Please wait a minute before requesting another code." }, { status: 429 });
    const code = String(randomInt(100000, 1000000));
    await prisma.adminLoginCode.deleteMany({ where: { email } });
    await prisma.adminLoginCode.create({ data: { email, codeHash: hash(code), expiresAt: new Date(Date.now() + 10 * 60_000) } });
    await sendEmail({ to: email, subject: "Your DSA/track admin login code", html: `<!doctype html><html><body style="margin:0;background:#f2f6f3;font-family:Arial,Helvetica,sans-serif;color:#16231c"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:36px 14px;background:#f2f6f3"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px"><tr><td style="padding:0 8px 18px"><span style="color:#087c5c;font-size:17px;font-weight:800">DSA<span style="color:#9aa79e">/</span>track</span><span style="float:right;color:#8a978e;font-size:11px;font-weight:700;letter-spacing:1px;padding-top:4px">ADMIN ACCESS</span></td></tr><tr><td style="padding:38px;border:1px solid #dfe9e1;border-radius:16px;background:#fff"><div style="display:inline-block;padding:7px 12px;border-radius:999px;background:#fff4df;color:#9b6918;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase">Secure sign in</div><h1 style="margin:20px 0 10px;font-size:28px;letter-spacing:-.5px">Your login code</h1><p style="margin:0;color:#68776d;font-size:15px;line-height:1.65">Use the one-time code below to open the DSA/track admin workspace.</p><div style="margin:28px 0;padding:18px;border:1px solid #bfe5d1;border-radius:10px;background:#f2fbf6;text-align:center;color:#087c5c;font-size:34px;letter-spacing:10px;font-weight:800">${escapeHtml(code)}</div><p style="margin:0;color:#68776d;font-size:13px;line-height:1.65">This code expires in <strong style="color:#34443a">10 minutes</strong>. If you did not request admin access, you can safely ignore this email.</p></td></tr><tr><td style="padding:22px 8px 0;text-align:center;color:#8a978e;font-size:11px">DSA/track · Secure curriculum management</td></tr></table></td></tr></table></body></html>` });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to send admin login code", error);
    return NextResponse.json({ error: "Could not send the login code. Check the Resend configuration." }, { status: 503 });
  }
}
