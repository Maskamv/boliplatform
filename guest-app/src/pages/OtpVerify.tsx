import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { checkin, requestOtp, verifyOtp } from "../lib/apiClient";
import { getMerchantId, setGuestToken } from "../lib/auth";
import { clearPendingScan, getPendingScan } from "../lib/pendingScan";
import { PATHS } from "../router";

interface LocationState {
  phone: string;
  devOtp?: string;
  name?: string;
}

export default function OtpVerify() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const merchantId = getMerchantId();

  const [code, setCode] = useState(state?.devOtp ?? "");

  const verifyMutation = useMutation({
    mutationFn: () => verifyOtp(state!.phone, merchantId!, code, state?.name),
    onSuccess: async ({ token }) => {
      setGuestToken(token);
      const pending = getPendingScan();
      if (pending) {
        try {
          await checkin(pending.outletId, pending.token);
        } finally {
          clearPendingScan();
        }
      }
      navigate(PATHS.home, { replace: true });
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => requestOtp(state!.phone, merchantId!),
    onSuccess: (data) => {
      if (data.devOtp) setCode(data.devOtp);
    },
  });

  if (!state?.phone || !merchantId) {
    return <Navigate to={PATHS.login} replace />;
  }

  return (
    <div className="flex min-h-screen flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">{t("otpVerify.title")}</h1>
        <p className="mt-2 text-mutedForeground">{t("otpVerify.subtitle", { phone: state.phone })}</p>
        {state.devOtp && <p className="mt-2 text-sm text-accent">{t("otpVerify.devHint")}</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          verifyMutation.mutate();
        }}
        className="flex flex-col gap-4"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-primary">{t("otpVerify.codeLabel")}</span>
          <input
            type="text"
            inputMode="numeric"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="rounded-xl2 border border-border px-4 py-3 text-center text-2xl tracking-[0.5em] focus:border-accent"
          />
        </label>

        {verifyMutation.isError && <p className="text-sm text-red-600">{(verifyMutation.error as Error).message}</p>}

        <button
          type="submit"
          disabled={verifyMutation.isPending}
          className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accentDark disabled:opacity-60"
        >
          {verifyMutation.isPending ? t("otpVerify.verifying") : t("otpVerify.verify")}
        </button>

        <button
          type="button"
          onClick={() => resendMutation.mutate()}
          disabled={resendMutation.isPending}
          className="text-sm font-medium text-accent"
        >
          {t("otpVerify.resend")}
        </button>
      </form>
    </div>
  );
}
