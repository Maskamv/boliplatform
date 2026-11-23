import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { ShareChannel, ShareKitLinkDto } from "@boli/shared";
import { getShareKit } from "../../lib/apiClient";

/**
 * Share kit: staff write a post once, then send it out from their own apps.
 * Nothing is auto-posted — Viber/WhatsApp open with the message pre-filled and
 * a person picks the groups and presses Send, which keeps merchants' accounts
 * within each platform's rules. Each channel gets its own tracked join link.
 */

const CHANNEL_LABELS: Record<ShareChannel, string> = {
  VIBER: "Viber",
  WHATSAPP: "WhatsApp",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
};

function buildPost(message: string, link: ShareKitLinkDto) {
  return `${message.trim()}\n\n${link.url}`;
}

/** Deep link that opens the channel's own app/site with the post ready, or null when the platform has no such link. */
function shareHref(link: ShareKitLinkDto, message: string): string | null {
  const text = encodeURIComponent(buildPost(message, link));
  switch (link.channel) {
    case "VIBER":
      return `viber://forward?text=${text}`;
    case "WHATSAPP":
      return `https://wa.me/?text=${text}`;
    case "FACEBOOK":
      // Facebook's sharer only takes a URL; the caption has to be pasted in.
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link.url)}`;
    default:
      // Instagram and TikTok have no web share link — copy the caption and post the QR image.
      return null;
  }
}

function ChannelCard({ link, message }: { link: ShareKitLinkDto; message: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const href = shareHref(link, message);
  const label = CHANNEL_LABELS[link.channel];

  const copy = async () => {
    await navigator.clipboard.writeText(buildPost(message, link));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl2 border border-border bg-white p-5">
      <p className="text-sm font-semibold text-primary">{label}</p>
      <p className="text-xs text-mutedForeground">{t(`shareKit.hints.${link.channel}`)}</p>
      <img src={link.qrDataUrl} alt={`${label} QR`} className="h-32 w-32 rounded-lg border border-border" />
      <p className="break-all rounded-lg bg-muted px-3 py-2 text-xs text-mutedForeground">{link.url}</p>
      <div className="mt-auto flex flex-wrap gap-2">
        {href && (
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accentDark"
          >
            {t("shareKit.shareTo", { channel: label })}
          </a>
        )}
        <button type="button" onClick={copy} className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-primary">
          {copied ? t("common.copied") : t("shareKit.copyPost")}
        </button>
        <a
          href={link.qrDataUrl}
          download={`boli-${link.channel.toLowerCase()}-qr.png`}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-primary"
        >
          {t("shareKit.downloadQr")}
        </a>
      </div>
    </div>
  );
}

export default function ShareKit() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useQuery({ queryKey: ["share-kit"], queryFn: getShareKit });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (data && !message) setMessage(t("shareKit.defaultMessage", { businessName: data.businessName }));
  }, [data, message, t]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">{t("shareKit.title")}</h1>
        <p className="mt-1 max-w-2xl text-sm text-mutedForeground">{t("shareKit.subtitle")}</p>
      </div>

      <label className="flex max-w-2xl flex-col gap-1.5 rounded-xl2 border border-border bg-white p-5">
        <span className="text-sm font-medium text-primary">{t("shareKit.message")}</span>
        <span className="text-xs text-mutedForeground">{t("shareKit.messageHint")}</span>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="rounded-lg border border-border px-3 py-2 text-sm" />
      </label>

      {isLoading && <p className="text-sm text-mutedForeground">{t("common.loading")}</p>}
      {isError && <p className="text-sm text-destructive">{t("common.error")}</p>}

      {data && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.links.map((link) => (
            <ChannelCard key={link.channel} link={link} message={message} />
          ))}
        </div>
      )}
    </div>
  );
}
