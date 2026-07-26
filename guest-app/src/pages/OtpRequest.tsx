import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { requestOtp } from "../lib/apiClient";
import { getMerchantId } from "../lib/auth";
import { PATHS } from "../router";

interface LocationState {
  prefillPhone?: string;
  prefillName?: string;
}

export default function OtpRequest() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [phone, setPhone] = useState(state?.prefillPhone || "+960 ");
  const merchantId = getMerchantId();

  const mutation = useMutation({
    mutationFn: () => requestOtp(phone.replace(/\s+/g, ""), merchantId!),
    onSuccess: (data) => {
      navigate(PATHS.loginVerify, {
        state: { phone: phone.replace(/\s+/g, ""), devOtp: data.devOtp, name: state?.prefillName },
      });
    },
  });

  if (!merchantId) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center text-mutedForeground">
        {t("scan.invalidCode")}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">{t("otpRequest.title")}</h1>
        <p className="mt-2 text-mutedForeground">{t("otpRequest.subtitle")}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="flex flex-col gap-4"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-primary">{t("otpRequest.phoneLabel")}</span>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("otpRequest.phonePlaceholder")}
            className="rounded-xl2 border border-border px-4 py-3 text-base focus:border-accent"
          />
        </label>

        {mutation.isError && <p className="text-sm text-red-600">{(mutation.error as Error).message}</p>}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accentDark disabled:opacity-60"
        >
          {mutation.isPending ? t("otpRequest.sending") : t("otpRequest.sendCode")}
        </button>
      </form>
    </div>
  );
}
