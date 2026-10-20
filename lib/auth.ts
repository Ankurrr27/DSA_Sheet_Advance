import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "dsa_session";
const SESSION_DAYS = 30;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = `${randomUUID()}${randomBytes(24).toString("hex")}`;
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.authSession.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSessionUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.authSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await prisma.authSession.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  return session.user;
}

export async function isAdmin(user: { email: string | null } | null) {
  if (!user?.email) return false;
  const admin = await prisma.admin.findUnique({ where: { email: user.email.trim().toLowerCase() }, select: { id: true } });
  return Boolean(admin);
}

export async function getAdminSession() {
  const user = await getSessionUser();
  return user && await isAdmin(user) ? user : null;
}

export async function requireAdmin() {
  const user = await getAdminSession();
  if (!user) throw new Error("ADMIN_REQUIRED");
  return user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await prisma.authSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  cookieStore.delete(SESSION_COOKIE);
}

export async function publicUser(user: { id: string; name: string; email: string | null; image: string | null }) {
  return { id: user.id, name: user.name, email: user.email, image: user.image, isAdmin: await isAdmin(user) };
}

export function googleRedirectUri(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
  const origin = configuredUrl
    ? (/^https?:\/\//i.test(configuredUrl) ? configuredUrl : `https://${configuredUrl}`)
    : new URL(request.url).origin;
  return `${origin}/api/auth/google/callback`;
}
