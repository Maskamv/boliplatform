import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ApiRequestError, confirmPhoneChange, requestPhoneChange } from "../lib/apiClient";

type Step = "idle" | "enterPhone" | "enterCode";

export function PhoneChangeCard({ currentPhone }: { currentPhone: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("idle");
  const [newPhone, setNewPhone] = useState("+960 ");
  const [code, setCode] = useState("");

  const requestMutation = useMutation({
    mutationFn: () => requestPhoneChange(newPhone.replace(/\s+/g, "")),
    onSuccess: (data) => {
      setStep("enterCode");
      if (data.devOtp) setCode(data.devOtp);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: () => confirmPhoneChange(newPhone.replace(/\s+/g, ""), code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setStep("idle");
      setCode("");
    },
  });

  if (step === "idle") {
    return (
      <div className="flex items-center justify-between rounded-xl2 border border-border bg-white p-4">
        <div>
          <p className="text-xs font-medium text-mutedForeground">{t("profile.phone")}</p>
          <p className="font-medium text-primary">{currentPhone}</p>
        </div>
        <button type="button" onClick={() => setStep("enterPhone")} className="text-sm font-semibold text-accent">
          {t("profile.changePhone")}
        </button>
      </div>
    );
  }

  if (step === "enterPhone") {
    return (
      <div className="rounded-xl2 border border-accent bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-primary">{t("profile.changePhone")}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestMutation.mutate();
          }}
          className="flex flex-col gap-3"
        >
          <input
            type="tel"
            required
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder={t("otpRequest.phonePlaceholder")}
            className="rounded-xl2 border border-border px-4 py-2.5 text-base focus:border-accent"
          />
          {requestMutation.isError && (
            <p className="text-sm text-red-600">{(requestMutation.error as Error).message}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={requestMutation.isPending}
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {requestMutation.isPending ? t("otpRequest.sending") : t("otpRequest.sendCode")}
            </button>
            <button type="button" onClick={() => setStep("idle")} className="rounded-full border border-border px-4 py-2 text-sm">
              {t("common.cancel")}
            </button>
          </div>
        </form>
      </div>
    );
  }

  const confirmError = confirmMutation.error instanceof ApiRequestError ? confirmMutation.error.message : null;

  return (
    <div className="rounded-xl2 border border-accent bg-white p-4">
      <p className="mb-1 text-sm font-semibold text-primary">{t("otpVerify.title")}</p>
      <p className="mb-3 text-sm text-mutedForeground">{t("otpVerify.subtitle", { phone: newPhone.replace(/\s+/g, "") })}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          confirmMutation.mutate();
        }}
        className="flex flex-col gap-3"
      >
        <input
          type="text"
          inputMode="numeric"
          required
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="rounded-xl2 border border-border px-4 py-2.5 text-center text-xl tracking-[0.4em] focus:border-accent"
        />
        {confirmError && <p className="text-sm text-red-600">{confirmError}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={confirmMutation.isPending}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {confirmMutation.isPending ? t("otpVerify.verifying") : t("otpVerify.verify")}
          </button>
          <button type="button" onClick={() => setStep("idle")} className="rounded-full border border-border px-4 py-2 text-sm">
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
