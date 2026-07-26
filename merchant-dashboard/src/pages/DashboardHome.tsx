import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getDashboardSummary, getVisitsTimeseries } from "../lib/apiClient";
import { StatCard } from "../components/StatCard";

export default function DashboardHome() {
  const { t } = useTranslation();
  const summaryQuery = useQuery({ queryKey: ["dashboard-summary"], queryFn: getDashboardSummary });
  const timeseriesQuery = useQuery({ queryKey: ["visits-timeseries"], queryFn: getVisitsTimeseries });

  const maxVisits = Math.max(1, ...(timeseriesQuery.data?.map((p) => p.visits) ?? [1]));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-primary">{t("dashboard.title")}</h1>

      {summaryQuery.data && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label={t("dashboard.totalGuests")} value={summaryQuery.data.totalGuests} />
          <StatCard label={t("dashboard.visits30d")} value={summaryQuery.data.totalVisits30d} />
          <StatCard label={t("dashboard.boliIssued30d")} value={summaryQuery.data.boliIssued30d} />
          <StatCard label={t("dashboard.boliRedeemed30d")} value={summaryQuery.data.boliRedeemed30d} />
          <StatCard label={t("dashboard.activeCampaigns")} value={summaryQuery.data.activeCampaigns} />
          <StatCard label={t("dashboard.pendingRedemptions")} value={summaryQuery.data.pendingRedemptions} />
        </div>
      )}

      {timeseriesQuery.data && (
        <div className="rounded-xl2 border border-border bg-white p-5">
          <p className="mb-4 text-sm font-semibold text-primary">{t("dashboard.visitsChart")}</p>
          <div className="flex h-32 items-end gap-1">
            {timeseriesQuery.data.map((point) => (
              <div key={point.date} className="group relative flex-1">
                <div
                  className="rounded-t bg-accent transition-all"
                  style={{ height: `${(point.visits / maxVisits) * 100}%`, minHeight: point.visits > 0 ? "4px" : "1px" }}
                />
                <div className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-primary px-2 py-1 text-xs text-white group-hover:block">
                  {point.date.slice(5)}: {point.visits}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
