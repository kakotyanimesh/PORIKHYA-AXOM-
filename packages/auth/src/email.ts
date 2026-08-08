// Resend REST transport — no SDK dependency, just fetch. Free tier covers our
// volume. Set RESEND_API_KEY and RESEND_FROM (e.g. "PorikhyaAxom
// <no-reply@yourdomain>"). Until a domain is verified in Resend, RESEND_FROM
// must be onboarding@resend.dev and mail only reaches your own account email.
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY and RESEND_FROM must be set to send email");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      ...(opts.text ? { text: opts.text } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend send failed (${res.status}): ${await res.text()}`);
  }
}

// Brand palette as hex — email clients don't grok oklch. Mirrors the app:
// indigo primary, red "Axom", deep-navy header (the auth panel colour).
const BRAND = {
  navy: "#1e1b4b",
  indigo: "#4f46e5",
  red: "#ef4444",
  ink: "#18181b",
  muted: "#6b7280",
  border: "#e5e7eb",
  pageBg: "#f4f4f7",
} as const;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Table-based, inline-styled, no external assets — renders in Gmail/Outlook/
// Apple Mail. The "PA" badge and wordmark are CSS/text, not images, so there's
// nothing to host and nothing to get blocked by image-proxying.
export function renderVerificationEmail(opts: {
  name?: string | null;
  url: string;
}): { html: string; text: string } {
  const first = (opts.name ?? "").trim().split(/\s+/)[0] || "there";
  const greeting = escapeHtml(first);
  const url = opts.url;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${BRAND.pageBg};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.pageBg};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid ${BRAND.border};border-radius:16px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <tr>
              <td style="background:${BRAND.navy};padding:24px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:36px;height:36px;background:${BRAND.indigo};border-radius:9px;text-align:center;vertical-align:middle;color:#ffffff;font-weight:700;font-size:14px;letter-spacing:0.5px;">PA</td>
                    <td style="padding-left:10px;font-size:19px;font-weight:600;color:#ffffff;letter-spacing:-0.3px;">Porikhya<span style="color:${BRAND.red};">Axom</span></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;color:${BRAND.ink};">Hi ${greeting}, let's verify your email</h1>
                <p style="margin:0 0 24px;font-size:14px;line-height:22px;color:${BRAND.muted};">
                  Welcome to PorikhyaAxom — your prep partner for Assam's competitive exams. Confirm this email to activate your account and start attempting mock tests.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                  <tr>
                    <td style="border-radius:10px;background:${BRAND.indigo};">
                      <a href="${url}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">Verify my email</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 6px;font-size:12px;line-height:20px;color:${BRAND.muted};">
                  Button not working? Paste this link into your browser:
                </p>
                <p style="margin:0 0 24px;font-size:12px;line-height:20px;word-break:break-all;">
                  <a href="${url}" style="color:${BRAND.indigo};text-decoration:underline;">${escapeHtml(url)}</a>
                </p>
                <p style="margin:0;font-size:12px;line-height:20px;color:${BRAND.muted};border-top:1px solid ${BRAND.border};padding-top:16px;">
                  Didn't create a PorikhyaAxom account? You can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 28px;">
                <p style="margin:0;font-size:11px;color:#9ca3af;">PorikhyaAxom · Mock tests for Assam TET, SI, APSC, ADRE &amp; more</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `Hi ${first}, verify your PorikhyaAxom email.

Welcome to PorikhyaAxom — your prep partner for Assam's competitive exams.
Confirm your email to activate your account:

${url}

Didn't create an account? You can safely ignore this email.`;

  return { html, text };
}
