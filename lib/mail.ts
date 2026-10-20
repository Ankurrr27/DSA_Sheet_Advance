const resendUrl = "https://api.resend.com/emails";

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Resend email is not configured.");

  const response = await fetch(resendUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  if (!response.ok) throw new Error(`Resend rejected the email (${response.status}).`);
}

export async function sendWelcomeEmail({ email, name }: { email: string; name: string }) {
  await sendEmail({
    to: email,
    subject: "Welcome to DSA/track — your DSA practice space",
    html: emailLayout({ preheader: "Your focused DSA practice space is ready.", content: `<div style="text-align:center"><div style="display:inline-block;padding:7px 12px;border-radius:999px;background:#e8f7f0;color:#087c5c;font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase">Welcome aboard</div><h1 style="margin:22px 0 12px;color:#16231c;font-size:32px;line-height:1.15;letter-spacing:-.6px">Welcome, ${escapeHtml(name)}.</h1><p style="margin:0 auto;max-width:430px;color:#68776d;font-size:16px;line-height:1.65">Your personal space for mastering DSA, building consistency, and making steady progress is ready.</p></div><div style="height:1px;background:#e5eee8;margin:30px 0"></div><p style="margin:0 0 14px;color:#34443a;font-size:15px;line-height:1.7">Start with one problem from the Striver A2Z sheet. Mark it complete when you solve it, save notes for later, and keep your momentum going.</p><div style="margin:28px 0;text-align:center"><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/practice" style="display:inline-block;padding:14px 24px;border-radius:9px;background:#087c5c;color:#fff;text-decoration:none;font-size:14px;font-weight:700">Open my practice sheet&nbsp; →</a></div><p style="margin:0;color:#68776d;font-size:14px;line-height:1.7">You’re taking a meaningful step toward becoming a stronger problem solver. We’re glad to have you here.</p>` }),
  });
}

function emailLayout({ preheader, content }: { preheader: string; content: string }) {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>DSA/track</title></head><body style="margin:0;background:#f2f6f3;font-family:Arial,Helvetica,sans-serif;color:#16231c"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f6f3;padding:36px 14px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px"><tr><td style="padding:0 8px 18px;text-align:left"><span style="color:#087c5c;font-size:17px;font-weight:800;letter-spacing:-.4px">DSA<span style="color:#9aa79e">/</span>track</span></td></tr><tr><td style="padding:38px 38px 34px;border:1px solid #dfe9e1;border-radius:16px;background:#fff">${content}</td></tr><tr><td style="padding:22px 8px 0;text-align:center;color:#8a978e;font-size:11px;line-height:1.6">You’re receiving this because you created an account on DSA/track.<br><span style="color:#aab4ad">© ${new Date().getFullYear()} DSA/track · Learn consistently. Solve confidently.</span></td></tr></table></td></tr></table></body></html>`;
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] || character);
}
