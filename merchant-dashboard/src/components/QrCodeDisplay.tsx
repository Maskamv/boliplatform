import { useTranslation } from "react-i18next";

interface QrCodeDisplayProps {
  dataUrl: string;
  scanUrl: string;
  onRegenerate: () => void;
  regenerating: boolean;
}

export function QrCodeDisplay({ dataUrl, scanUrl, onRegenerate, regenerating }: QrCodeDisplayProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl2 border border-border bg-white p-5">
      <p className="text-sm font-semibold text-primary">{t("outlets.qrCode")}</p>
      <p className="mt-1 text-sm text-mutedForeground">{t("outlets.qrCodeHint")}</p>

      <img src={dataUrl} alt={t("outlets.qrCode")} className="mt-4 h-48 w-48 rounded-xl2 border border-border" />

      <p className="mt-3 break-all rounded-lg bg-muted px-3 py-2 text-xs text-mutedForeground">{scanUrl}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={dataUrl}
          download="boli-qr-code.png"
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accentDark"
        >
          {t("outlets.downloadQr")}
        </a>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={regenerating}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-destructive hover:text-destructive disabled:opacity-60"
        >
          {t("outlets.regenerateQr")}
        </button>
      </div>
      <p className="mt-2 text-xs text-mutedForeground">{t("outlets.regenerateWarning")}</p>
    </div>
  );
}
