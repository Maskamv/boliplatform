import QRCode from "qrcode";
import { env } from "../env.js";

/** Builds the guest-app URL a QR code should encode for a given outlet. */
export function buildScanUrl(outletId: string, qrCodeToken: string): string {
  const url = new URL(`/scan/${outletId}`, env.GUEST_APP_URL);
  url.searchParams.set("t", qrCodeToken);
  return url.toString();
}

/** Generates a real, scannable QR code as a PNG data URL — nothing is persisted to disk. */
export async function generateQrCodeDataUrl(targetUrl: string): Promise<string> {
  return QRCode.toDataURL(targetUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320,
  });
}
