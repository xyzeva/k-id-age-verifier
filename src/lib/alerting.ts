import { env } from "$env/dynamic/private";

export async function sendAlert(content: string) {
  const res = await fetch(env.ALERTS_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    console.warn({
      message: "failed to send alert to webhook",
      status: res.status,
      text: await res.text().catch(() => null),
    });
  }
}
