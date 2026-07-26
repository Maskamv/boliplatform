import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsQR from "jsqr";
import { useTranslation } from "react-i18next";
import { PATHS } from "../router";

type ScannerState = "requesting" | "scanning" | "denied" | "unsupported";

/**
 * In-app camera QR scanner for returning guests checking in on a visit that
 * didn't start from tapping a printed QR with the phone's own camera app.
 * Decodes frames locally with jsQR (no video ever leaves the device) and,
 * on a hit, does a full navigation to the decoded URL — reusing whatever
 * page it points to (in practice always our own /scan/:outletId, so this
 * lands on the same LandingScan flow a physical-QR scan would).
 */
export default function ScanQr() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>();
  const [state, setState] = useState<ScannerState>("requesting");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!navigator.mediaDevices?.getUserMedia) {
      setState("unsupported");
      return;
    }

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code?.data) {
            handleResult(code.data);
            return;
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    function handleResult(text: string) {
      try {
        // eslint-disable-next-line no-new
        new URL(text); // throws if not a valid absolute URL
        // Full navigation (not client-side router push) so this works
        // correctly regardless of which origin the QR was generated for.
        window.location.href = text;
      } catch {
        setNotice(t("scanQr.notBoliCode"));
        setTimeout(() => setNotice(null), 1800);
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setState("scanning");
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        if (!cancelled) setState("denied");
      }
    }

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-lg font-semibold text-white">{t("scanQr.title")}</h1>
        <button type="button" onClick={() => navigate(PATHS.home)} className="text-sm font-medium text-white/80">
          {t("common.cancel")}
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
        <canvas ref={canvasRef} className="hidden" />

        {state === "scanning" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-64 w-64 rounded-2xl border-4 border-white/80" />
          </div>
        )}

        {notice && (
          <div className="absolute inset-x-6 top-6 rounded-xl2 bg-white px-4 py-3 text-center text-sm font-medium text-primary">{notice}</div>
        )}

        {state === "requesting" && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-white/80">{t("scanQr.requesting")}</div>
        )}

        {state === "denied" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-semibold text-white">{t("scanQr.permissionDenied")}</p>
            <p className="text-sm text-white/70">{t("scanQr.permissionDeniedHint")}</p>
            <button
              type="button"
              onClick={() => navigate(PATHS.home)}
              className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-primary"
            >
              {t("common.back")}
            </button>
          </div>
        )}

        {state === "unsupported" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-semibold text-white">{t("scanQr.unsupported")}</p>
            <button
              type="button"
              onClick={() => navigate(PATHS.home)}
              className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-primary"
            >
              {t("common.back")}
            </button>
          </div>
        )}
      </div>

      <p className="px-6 py-5 text-center text-sm text-white/70">{t("scanQr.subtitle")}</p>
    </div>
  );
}
