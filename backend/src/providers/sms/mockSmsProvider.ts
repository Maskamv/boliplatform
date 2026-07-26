import type { SendOtpSmsInput, SendOtpSmsResult, SendSmsMessageInput, SendSmsMessageResult, SmsProvider } from "./types.js";

export class MockSmsProvider implements SmsProvider {
  async sendOtp(input: SendOtpSmsInput): Promise<SendOtpSmsResult> {
    console.log(`[MOCK SMS] -> ${input.toPhone}: Your Boli verification code is ${input.code}`);
    return {
      status: "SENT_MOCK",
      providerResponse: { mock: true, sentAt: new Date().toISOString() },
    };
  }

  async sendMessage(input: SendSmsMessageInput): Promise<SendSmsMessageResult> {
    console.log(`[MOCK SMS] -> ${input.toPhone}: ${input.body}`);
    return {
      status: "SENT_MOCK",
      providerResponse: { mock: true, sentAt: new Date().toISOString() },
    };
  }
}
