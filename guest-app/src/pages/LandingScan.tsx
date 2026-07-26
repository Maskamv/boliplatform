import { useEffect, type ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getScanInfo, checkin } from "../lib/apiClient";
import { getMerchantId, isLoggedIn, setMerchantId } from "../lib/auth";
import { setPendingScan } from "../lib/pendingScan";
import { PATHS } from "../router";

export default function LandingScan() {
  const { t } = useTranslation();
  const { outletId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("t") ?? "";
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["scan", outletId, token],
    queryFn: () => getScanInfo(outletId, token),
    enabled: Boolean(outletId && token),
    retry: false,
  });

  useEffect(() => {
    if (data) setMerchantId(data.merchant.id);
  }, [data]);

  const alreadyLoggedInForThisMerchant = isLoggedIn() && data && getMerchantId() === data.merchant.id;

  useEffect(() => {
    if (!alreadyLoggedInForThisMerchant || !data) return;
    checkin(outletId, token)
      .catch(() => {
        // Already checked in recently or a transient error — either way, send them to their balance.
      })
      .finally(() => navigate(PATHS.home, { replace: true }));
  }, [alreadyLoggedInForThisMerchant, data, outletId, token, navigate]);

  if (!outletId || !token) {
    return <CenteredMessage>{t("scan.invalidCode")}</CenteredMessage>;
  }

  if (isLoading || alreadyLoggedInForThisMerchant) {
    return <CenteredMessage>{t("common.loading")}</CenteredMessage>;
  }

  if (isError || !data) {
    return <CenteredMessage>{t("scan.invalidCode")}</CenteredMessage>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <ellipse cx="12" cy="12" rx="10" ry="6.2" fill="#0F766E" />
        </svg>
      </div>
      <div>
        <h1 className="text-2xl font-extrabold text-primary">{t("scan.title", { merchantName: data.merchant.businessName })}</h1>
        <p className="mt-2 text-mutedForeground">{t("scan.subtitle")}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          setPendingScan(outletId, token);
          navigate(PATHS.login);
        }}
        className="w-full max-w-xs rounded-full bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accentDark"
      >
        {t("scan.continueWithPhone")}
      </button>
    </div>
  );
}

function CenteredMessage({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center px-6 text-center text-mutedForeground">{children}</div>;
}
