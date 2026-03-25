import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

function minutesSince(dateString) {
  if (!dateString) return Infinity;
  const then = new Date(dateString).getTime();
  const now = Date.now();
  return (now - then) / 1000 / 60;
}

export function shouldSendAlert(lastAlert, cooldownMinutes) {
  if (!lastAlert) return true;
  return minutesSince(lastAlert.sent_at) >= cooldownMinutes;
}

export async function sendTicketsAvailableEmail(watch, result) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_TO_EMAIL;
  const from = process.env.ALERT_FROM_EMAIL;

  console.log("ALERT ENV CHECK:", {
    hasResendKey: !!resendApiKey,
    to,
    from,
  });

  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is missing");
  }

  if (!to || !from) {
    throw new Error("ALERT_TO_EMAIL or ALERT_FROM_EMAIL is missing");
  }

  const resend = new Resend(resendApiKey);

  const subject = `Tickets available: ${watch.name}`;

  const html = `
    <h2>Tickets may be available</h2>
    <p><strong>${watch.name}</strong></p>
    <p><a href="${watch.url}">${watch.url}</a></p>
    <p><strong>Quantity found:</strong> ${result.count ?? 0}</p>
    <p><strong>Price:</strong> ${result.price ?? "Unknown"}</p>
    <p>Checked at: ${new Date().toISOString()}</p>
  `;

  await resend.emails.send({
    from,
    to,
    subject,
    html,
  });
}