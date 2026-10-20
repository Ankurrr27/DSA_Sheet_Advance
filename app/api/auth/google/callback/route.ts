import { NextResponse } from "next/server";
import { createSession, googleRedirectUri } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/mail";

type GoogleProfile = { sub: string; name?: string; email?: string; picture?: string };

export async function GET(request: Request) {
  let stage = "callback";
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const requestCookies = request.headers.get("cookie") || "";
    const readCookie = (name: string) => requestCookies.match(new RegExp(`(?:^|; )${name}=([^;]*)`))?.[1];
    const expectedState = readCookie("google_oauth_state");
    const verifier = readCookie("google_oauth_verifier");
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!code || !state || !expectedState || state !== expectedState || !verifier || !clientId || !clientSecret) {
      return NextResponse.redirect(new URL(`/practice?auth=error&stage=${encodeURIComponent(stage)}`, request.url));
    }

    stage = "token exchange";
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: googleRedirectUri(request), grant_type: "authorization_code", code_verifier: verifier }),
    });
    if (!tokenResponse.ok) throw new Error("Google token exchange failed");
    const tokens = await tokenResponse.json() as { access_token?: string };
    if (!tokens.access_token) throw new Error("Google did not return an access token");
    stage = "profile lookup";
    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    if (!profileResponse.ok) throw new Error("Google profile lookup failed");
    const profile = await profileResponse.json() as GoogleProfile;
    if (!profile.sub || !profile.email) throw new Error("Google account did not provide a verified email");

    stage = "user persistence";
    const existingUser = await prisma.user.findFirst({ where: { OR: [{ googleSub: profile.sub }, { email: profile.email }] } });
    const user = existingUser
      ? await prisma.user.update({ where: { id: existingUser.id }, data: { googleSub: profile.sub, name: profile.name || profile.email, email: profile.email, image: existingUser.image || profile.picture || null } })
      : await prisma.user.create({ data: { googleSub: profile.sub, name: profile.name || profile.email, email: profile.email, image: profile.picture || null } });
    if (!user.welcomeEmailSentAt) {
      try {
        await sendWelcomeEmail({ email: profile.email, name: profile.name || profile.email });
        await prisma.user.update({ where: { id: user.id }, data: { welcomeEmailSentAt: new Date() } });
      } catch (error) {
        console.error("Welcome email failed:", error);
      }
    }
    stage = "session creation";
    await createSession(user.id);
    const response = NextResponse.redirect(new URL("/practice?auth=success", request.url));
    response.cookies.delete("google_oauth_state");
    response.cookies.delete("google_oauth_verifier");
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Google authentication failed during ${stage}: ${message}`);
    return NextResponse.redirect(new URL(`/practice?auth=error&stage=${encodeURIComponent(stage)}`, request.url));
  }
}
