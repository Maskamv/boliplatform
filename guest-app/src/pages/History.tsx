import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { getMyRedemptions, getTransactions, getVisits } from "../lib/apiClient";
import { PATHS } from "../router";

type Tab = "visits" | "transactions" | "redemptions";

export default function History() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("visits");

  const visitsQuery = useQuery({ queryKey: ["visits"], queryFn: getVisits, enabled: tab === "visits" });
  const txnsQuery = useQuery({ queryKey: ["transactions"], queryFn: getTransactions, enabled: tab === "transactions" });
  const redemptionsQuery = useQuery({ queryKey: ["redemptions"], queryFn: getMyRedemptions, enabled: tab === "redemptions" });

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-6 pb-28 pt-8">
      <h1 className="text-2xl font-extrabold text-primary">{t("history.title")}</h1>

      <div className="flex gap-2 rounded-full bg-muted p-1">
        {(["visits", "transactions", "redemptions"] as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
              tab === key ? "bg-white text-primary shadow-sm" : "text-mutedForeground"
            }`}
          >
            {t(`history.${key}Tab`)}
          </button>
        ))}
      </div>

      {tab === "visits" &&
        (visitsQuery.data && visitsQuery.data.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {visitsQuery.data.map((v) => (
              <li key={v.id} className="flex items-center justify-between rounded-xl2 border border-border bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-primary">{v.outletName}</p>
                  <p className="text-xs text-mutedForeground">{new Date(v.checkedInAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-accent">+{v.boliEarned}</span>
                  <Link to={PATHS.review(v.id)} className="text-xs font-semibold text-accent underline">
                    {t("review.title")}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-mutedForeground">{t("history.noVisits")}</p>
        ))}

      {tab === "transactions" &&
        (txnsQuery.data && txnsQuery.data.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {txnsQuery.data.map((txn) => (
              <li key={txn.id} className="flex items-center justify-between rounded-xl2 border border-border bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-primary">{txn.note ?? txn.type}</p>
                  <p className="text-xs text-mutedForeground">{new Date(txn.createdAt).toLocaleString()}</p>
                </div>
                <span className={`text-sm font-bold ${txn.amount >= 0 ? "text-accent" : "text-mutedForeground"}`}>
                  {txn.amount >= 0 ? t("history.earned", { amount: txn.amount }) : t("history.spent", { amount: Math.abs(txn.amount) })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-mutedForeground">{t("history.noTransactions")}</p>
        ))}

      {tab === "redemptions" &&
        (redemptionsQuery.data && redemptionsQuery.data.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {redemptionsQuery.data.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-xl2 border border-border bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-primary">{r.rewardName}</p>
                  <p className="text-xs text-mutedForeground">{new Date(r.redeemedAt).toLocaleString()}</p>
                </div>
                <span className="text-xs font-semibold uppercase text-mutedForeground">{r.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-mutedForeground">{t("history.noRedemptions")}</p>
        ))}
    </div>
  );
}
