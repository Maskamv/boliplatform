import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ApiRequestError, getReferralCode, redeemReferralCode } from "../lib/apiClient";

export default function Referral() {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  const codeQuery = useQuery({ queryKey: ["referral-code"], queryFn: getReferralCode });

  const redeemMutation = useMutation({
    mutationFn: () => redeemReferralCode(code.trim()),
  });

  const onlyBeforeFirstVisit = redeemMutation.error instanceof ApiRequestError && redeemMutation.error.status === 400;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 px-6 pb-28 pt-8">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">{t("referral.title")}</h1>
        <p className="mt-1 text-mutedForeground">{t("referral.subtitle")}</p>
      </div>

      {codeQuery.data && (
        <div className="rounded-xl2 border border-accent bg-accent/5 p-5 text-center">
          <p className="text-sm font-medium text-mutedForeground">{t("referral.yourCode")}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-widest text-accent">{codeQuery.data.code}</p>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(codeQuery.data.code).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="mt-4 rounded-full bg-accent px-6 py-2 text-sm font-semibold text-white hover:bg-accentDark"
          >
            {copied ? t("referral.copied") : t("referral.copy")}
          </button>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-mutedForeground">{t("referral.haveCode")}</h2>

        {redeemMutation.isSuccess ? (
          <p className="rounded-xl2 bg-accent/10 px-4 py-3 text-sm font-medium text-accent">{t("referral.redeemSuccess")}</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              redeemMutation.mutate();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("referral.codePlaceholder")}
              className="flex-1 rounded-xl2 border border-border px-4 py-3 text-base uppercase focus:border-accent"
            />
            <button
              type="submit"
              disabled={redeemMutation.isPending || !code.trim()}
              className="rounded-xl2 bg-accent px-5 py-3 font-semibold text-white transition-colors hover:bg-accentDark disabled:opacity-60"
            >
              {t("referral.redeem")}
            </button>
          </form>
        )}

        {onlyBeforeFirstVisit && <p className="mt-2 text-sm text-red-600">{t("referral.onlyBeforeFirstVisit")}</p>}
      </div>
    </div>
  );
}
