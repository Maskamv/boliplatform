import type { MessageStatus } from "@boli/shared";

export interface SendOtpSmsInput {
  toPhone: string;
  code: string;
}

export interface SendSmsMessageInput {
  toPhone: string;
  body: string;
}

export interface SendOtpSmsResult {
  status: MessageStatus;
  providerResponse: Record<string, unknown>;
}

export type SendSmsMessageResult = SendOtpSmsResult;

/** Swap in a real SMS provider (Twilio, etc.) by implementing this interface — call sites are unaffected. */
export interface SmsProvider {
  sendOtp(input: SendOtpSmsInput): Promise<SendOtpSmsResult>;
  sendMessage(input: SendSmsMessageInput): Promise<SendSmsMessageResult>;
}
