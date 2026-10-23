/**
 * Transactional email via Resend. No-ops (returns false) unless RESEND_API_KEY
 * is set as an app secret, so the form never breaks when email isn't configured.
 *
 *   whop apps secrets set --secret RESEND_API_KEY=re_xxx
 *   whop apps secrets set --secret MAIL_FROM="IronRidge Roofing <hello@yourdomain.com>"
 *
 * Until you verify a sending domain in Resend, use the default
 * "onboarding@resend.dev" sender — it can only deliver to your own Resend
 * account email (fine for testing/recording).
 */
import { site } from "../config/site";

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.MAIL_FROM || `${site.brand.name} <onboarding@resend.dev>`;

export function mailConfigured(): boolean {
  return !!RESEND_KEY;
}

export async function sendThankYou(to: string, name: string, service?: string): Promise<boolean> {
  if (!RESEND_KEY || !to) return false;
  const t = site.theme;
  const first = (name || "there").split(" ")[0];
  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:0 auto;color:${t.text}">
    <div style="background:${t.primary};padding:24px 28px;border-radius:14px 14px 0 0">
      <div style="color:#fff;font-size:20px;font-weight:700;letter-spacing:.3px">${site.brand.shortName}</div>
      <div style="color:rgba(255,255,255,.7);font-size:11px;letter-spacing:2px;text-transform:uppercase">Roofing &amp; Exteriors</div>
    </div>
    <div style="background:${t.surface};border:1px solid ${t.border};border-top:none;padding:28px;border-radius:0 0 14px 14px">
      <h1 style="font-size:20px;margin:0 0 12px;color:${t.primary}">Thanks for your estimate request, ${first}!</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 0 14px">
        We've received your request${service ? ` for <strong>${service}</strong>` : ""} and a ${site.brand.shortName} roofing
        specialist will reach out within <strong>1 business day</strong> to schedule your free assessment.
      </p>
      <p style="font-size:15px;line-height:1.6;margin:0 0 20px">
        Need us sooner? Call <a href="${site.contact.phoneHref}" style="color:${t.accent};font-weight:600">${site.contact.phone}</a>.
      </p>
      <div style="background:${t.background};border:1px solid ${t.border};border-radius:10px;padding:14px 16px;font-size:13px;color:${t.muted}">
        ${site.brand.tagline} · ${site.contact.cityState} · ${site.contact.hours}
      </div>
      <p style="font-size:12px;color:${t.muted};margin:18px 0 0">
        ${site.brand.name}${site.contact.license ? ` · ${site.contact.license}` : ""}
      </p>
    </div>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${RESEND_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject: `Thanks for your estimate request — ${site.brand.name}`,
        html,
      }),
    });
    if (!res.ok) console.error(`[mail] resend ${res.status}: ${await res.text()}`);
    return res.ok;
  } catch (err) {
    console.error("[mail] send failed", (err as Error).message);
    return false;
  }
}
