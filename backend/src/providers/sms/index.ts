import { env } from "../../env.js";
import { MockSmsProvider } from "./mockSmsProvider.js";
import type { SmsProvider } from "./types.js";

function createSmsProvider(): SmsProvider {
  switch (env.SMS_PROVIDER) {
    case "mock":
    default:
      return new MockSmsProvider();
  }
}

export const smsProvider = createSmsProvider();
export type { SendOtpSmsInput, SendOtpSmsResult, SendSmsMessageInput, SendSmsMessageResult, SmsProvider } from "./types.js";
