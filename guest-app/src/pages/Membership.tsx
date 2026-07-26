import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getMembership } from "../lib/apiClient";
import { TierProgressBar } from "../components/TierProgressBar";

export default function Membership() {
  const { t } = useTranslation();
  const { data } = useQuery({ queryKey: ["membership"], queryFn: getMembership });

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-6 pb-28 pt-8">
      <h1 className="text-2xl font-extrabold text-primary">{t("membership.title")}</h1>

      {data && (
        <>
          <div className="rounded-xl2 border border-border bg-white p-5">
            <p className="text-sm font-medium text-mutedForeground">{t("membership.currentTier")}</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: data.currentTier?.badgeColor ?? "#0F172A" }}>
              {data.currentTier?.name ?? t("membership.noTier")}
            </p>

            <div className="mt-4">
              <TierProgressBar
                totalVisits={data.totalVisits}
                currentTierMinVisits={data.currentTier?.minVisits ?? 0}
                nextTierMinVisits={data.nextTier?.minVisits ?? null}
              />
              <p className="mt-2 text-sm text-mutedForeground">
                {data.nextTier
                  ? t("membership.nextTier", { visits: data.visitsToNextTier, tierName: data.nextTier.name })
                  : t("membership.maxTier")}
              </p>
            </div>

            {data.currentTier?.perks && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm font-medium text-primary">{t("membership.perks")}</p>
                <p className="mt-1 text-sm text-mutedForeground">{data.currentTier.perks}</p>
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-mutedForeground">{t("membership.allTiers")}</h2>
            <ul className="flex flex-col gap-2">
              {data.allTiers.map((tier) => (
                <li
                  key={tier.id}
                  className={`flex items-center justify-between rounded-xl2 border px-4 py-3 ${
                    tier.id === data.currentTier?.id ? "border-accent bg-accent/5" : "border-border bg-white"
                  }`}
                >
                  <span className="font-semibold" style={{ color: tier.badgeColor ?? "#0F172A" }}>
                    {tier.name}
                  </span>
                  <span className="text-sm text-mutedForeground">{tier.minVisits}+ {t("common.visits")}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
