import type { MessageStatus } from "@boli/shared";

export interface SendWhatsAppMessageInput {
  toPhone: string;
  body: string;
}

export interface SendWhatsAppMessageResult {
  status: MessageStatus;
  providerResponse: Record<string, unknown>;
}

/** Swap in a real Meta Cloud API (or similar) client by implementing this interface and pointing WHATSAPP_PROVIDER at it in index.ts — no call site changes needed. Deliberately DB-free: persistence (MessageLog) is the caller's responsibility. */
export interface WhatsAppProvider {
  sendMessage(input: SendWhatsAppMessageInput): Promise<SendWhatsAppMessageResult>;
}
