import type { SendWhatsAppMessageInput, SendWhatsAppMessageResult, WhatsAppProvider } from "./types.js";

export class MockWhatsAppProvider implements WhatsAppProvider {
  async sendMessage(input: SendWhatsAppMessageInput): Promise<SendWhatsAppMessageResult> {
    console.log(`[MOCK WHATSAPP] -> ${input.toPhone}: ${input.body}`);
    return {
      status: "SENT_MOCK",
      providerResponse: { mock: true, sentAt: new Date().toISOString() },
    };
  }
}
