import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { getProfile, getTransactions } from "../lib/apiClient";
import { BoliBalanceCard } from "../components/BoliBalanceCard";
import { PATHS } from "../router";

export default function Home() {
  const { t } = useTranslation();
  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const txnsQuery = useQuery({ queryKey: ["transactions"], queryFn: getTransactions });

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-6 pb-28 pt-8">
      {profileQuery.data?.name && <h1 className="text-xl font-bold text-primary">{t("home.greeting", { name: profileQuery.data.name })}</h1>}

      <BoliBalanceCard balance={profileQuery.data?.boliBalance ?? 0} />

      <Link
        to={PATHS.scanQr}
        className="flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-center font-semibold text-white transition-colors hover:bg-accentDark"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.75" />
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.75" />
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.75" />
          <path d="M14 14h3m4 0h-1m-6 3v4m7-7v7h-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        {t("home.scanToCheckIn")}
      </Link>

      <p className="rounded-xl2 bg-muted p-4 text-sm text-mutedForeground">{t("home.aboutBoli")}</p>

      <Link
        to={PATHS.rewards}
        className="rounded-full border border-accent px-6 py-3 text-center font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
      >
        {t("home.viewRewards")}
      </Link>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-mutedForeground">{t("home.recentActivity")}</h2>
        {txnsQuery.data && txnsQuery.data.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {txnsQuery.data.slice(0, 8).map((txn) => (
              <li key={txn.id} className="flex items-center justify-between rounded-xl2 border border-border bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-primary">{txn.note ?? txn.type}</p>
                  <p className="text-xs text-mutedForeground">{new Date(txn.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-sm font-bold ${txn.amount >= 0 ? "text-accent" : "text-mutedForeground"}`}>
                  {txn.amount >= 0 ? `+${txn.amount}` : txn.amount}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-mutedForeground">{t("home.noActivity")}</p>
        )}
      </div>
    </div>
  );
}
