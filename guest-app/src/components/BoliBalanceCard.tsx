import { useTranslation } from "react-i18next";

export function BoliBalanceCard({ balance }: { balance: number }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl2 bg-primary p-6 text-white shadow-sm">
      <p className="text-sm font-medium text-white/70">{t("home.balanceLabel")}</p>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="text-4xl font-extrabold tracking-tight">{balance}</span>
        <span className="text-lg font-semibold text-white/80">{t("common.boli")}</span>
      </p>
    </div>
  );
}
