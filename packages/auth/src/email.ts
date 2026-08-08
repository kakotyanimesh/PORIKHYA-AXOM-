// Resend REST transport — no SDK dependency, just fetch. Free tier covers our
// volume. Set RESEND_API_KEY and RESEND_FROM (e.g. "Porikhyaaxom
// <no-reply@yourdomain>"). Until a domain is verified in Resend, RESEND_FROM
// must be onboarding@resend.dev and mail only reaches your own account email.
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
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
    body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html }),
  });

  if (!res.ok) {
    throw new Error(`Resend send failed (${res.status}): ${await res.text()}`);
  }
}
