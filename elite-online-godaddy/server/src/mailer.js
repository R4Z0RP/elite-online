/* Envío de correo vía Brevo (API HTTP transaccional).
   Requiere en el entorno: BREVO_API_KEY, LEAD_TO y LEAD_FROM. */

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

export function mailerConfigured() {
  return Boolean(
    process.env.BREVO_API_KEY && process.env.LEAD_TO && process.env.LEAD_FROM
  );
}

// Convierte "a@x.com, b@y.com" → [{email:"a@x.com"}, {email:"b@y.com"}]
function recipients() {
  return (process.env.LEAD_TO || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
    .map((email) => ({ email }));
}

export async function sendLeadEmail({ subject, text, html, replyTo, replyToName }) {
  const payload = {
    sender: {
      email: process.env.LEAD_FROM,
      name: process.env.LEAD_FROM_NAME || "ELITE Online — Web",
    },
    to: recipients(),
    subject,
    textContent: text,
    htmlContent: html,
  };
  if (replyTo) payload.replyTo = { email: replyTo, name: replyToName || replyTo };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(BREVO_URL, {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Brevo respondió ${res.status}: ${body.slice(0, 300)}`);
    }
    const data = await res.json().catch(() => ({}));
    return data.messageId || "ok";
  } finally {
    clearTimeout(timer);
  }
}
