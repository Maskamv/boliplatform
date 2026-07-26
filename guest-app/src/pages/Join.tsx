import { useEffect, type ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getMerchantPublic } from "../lib/apiClient";
import { isLoggedIn, setMerchantId } from "../lib/auth";
import { PATHS } from "../router";

/**
 * Landing page for an admin-sent invite link (/join/:merchantId?phone=&name=).
 * Unlike LandingScan, there's no outlet/QR token here — this is a direct
 * signup invitation, not a visit check-in, so it hands off to the same
 * OTP request/verify flow without ever calling checkin().
 */
export default function Join() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { merchantId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const phone = searchParams.get("phone") ?? "";
  const name = searchParams.get("name") ?? "";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["merchant-public", merchantId],
    queryFn: () => getMerchantPublic(merchantId),
    enabled: Boolean(merchantId),
    retry: false,
  });

  useEffect(() => {
    if (data) setMerchantId(data.id);
  }, [data]);

  useEffect(() => {
    if (data && isLoggedIn()) {
      navigate(PATHS.home, { replace: true });
    }
  }, [data, navigate]);

  if (!merchantId) {
    return <CenteredMessage>{t("scan.invalidCode")}</CenteredMessage>;
  }

  if (isLoading) {
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
        <h1 className="text-2xl font-extrabold text-primary">{t("join.title", { merchantName: data.businessName })}</h1>
        <p className="mt-2 text-mutedForeground">{t("join.subtitle")}</p>
      </div>
      <button
        type="button"
        onClick={() => navigate(PATHS.login, { state: { prefillPhone: phone, prefillName: name } })}
        className="w-full max-w-xs rounded-full bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accentDark"
      >
        {t("join.getStarted")}
      </button>
    </div>
  );
}

function CenteredMessage({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center px-6 text-center text-mutedForeground">{children}</div>;
}
