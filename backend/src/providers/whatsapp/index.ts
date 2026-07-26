import { env } from "../../env.js";
import { MockWhatsAppProvider } from "./mockWhatsappProvider.js";
import type { WhatsAppProvider } from "./types.js";

function createWhatsAppProvider(): WhatsAppProvider {
  switch (env.WHATSAPP_PROVIDER) {
    case "mock":
    default:
      return new MockWhatsAppProvider();
  }
}

export const whatsAppProvider = createWhatsAppProvider();
export type { SendWhatsAppMessageInput, SendWhatsAppMessageResult, WhatsAppProvider } from "./types.js";
