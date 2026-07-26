import type { Channel } from "@boli/shared";
import { whatsAppProvider } from "../providers/whatsapp/index.js";
import { smsProvider } from "../providers/sms/index.js";

/** Renders `{{key}}` placeholders in a campaign message template. Unknown keys are left as-is rather than silently dropped, so a typo in a template is easy to spot in the mock outbox. */
export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => (key in vars ? vars[key] : match));
}

export async function sendChannelMessage(channel: Channel, toPhone: string, body: string) {
  if (channel === "SMS") {
    return smsProvider.sendMessage({ toPhone, body });
  }
  return whatsAppProvider.sendMessage({ toPhone, body });
}
