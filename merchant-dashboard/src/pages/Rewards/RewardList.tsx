import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { deleteReward, fulfillRedemption, listRedemptions, listRewards, updateReward } from "../../lib/apiClient";
import { DataTable } from "../../components/DataTable";
import { PATHS } from "../../router";

export default function RewardList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data } = useQuery({ queryKey: ["rewards"], queryFn: listRewards });
  const redemptionsQuery = useQuery({ queryKey: ["redemptions"], queryFn: listRedemptions });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => updateReward(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rewards"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteReward(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rewards"] }),
  });

  const fulfill = useMutation({
    mutationFn: (id: string) => fulfillRedemption(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["redemptions"] }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-primary">{t("rewards.title")}</h1>
        <button
          type="button"
          onClick={() => navigate(PATHS.rewardNew)}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accentDark"
        >
          {t("rewards.addReward")}
        </button>
      </div>

      <DataTable
        rows={data ?? []}
        keyField={(r) => r.id}
        emptyMessage={t("common.noResults")}
        columns={[
          { header: t("common.name"), render: (r) => r.name },
          { header: t("rewards.boliCost"), render: (r) => r.boliCost },
          { header: t("rewards.stock"), render: (r) => (r.stock === null ? t("rewards.unlimited") : r.stock) },
          { header: t("common.status"), render: (r) => (r.isActive ? t("common.active") : t("common.inactive")) },
          {
            header: t("common.actions"),
            render: (r) => (
              <div className="flex gap-3">
                <button type="button" onClick={() => navigate(PATHS.rewardEdit(r.id))} className="text-xs font-semibold text-accent">
                  {t("common.edit")}
                </button>
                <button
                  type="button"
                  onClick={() => toggleActive.mutate({ id: r.id, isActive: !r.isActive })}
                  className="text-xs font-semibold text-secondary"
                >
                  {r.isActive ? t("common.inactive") : t("common.active")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(t("common.confirmDelete"))) remove.mutate(r.id);
                  }}
                  className="text-xs font-semibold text-destructive"
                >
                  {t("common.delete")}
                </button>
              </div>
            ),
          },
        ]}
      />

      <div>
        <h2 className="text-lg font-bold text-primary">{t("rewards.redemptions")}</h2>
        <p className="mt-1 text-sm text-mutedForeground">{t("rewards.redemptionsHint")}</p>
      </div>

      <DataTable
        rows={redemptionsQuery.data ?? []}
        keyField={(r) => r.id}
        emptyMessage={t("common.noResults")}
        columns={[
          { header: t("common.name"), render: (r) => r.guestName },
          { header: t("rewards.title"), render: (r) => r.rewardName },
          { header: t("rewards.boliCost"), render: (r) => r.boliSpent },
          { header: t("common.status"), render: (r) => t(`rewards.redemptionStatus.${r.status}`) },
          {
            header: t("common.actions"),
            render: (r) =>
              r.status === "PENDING" ? (
                <button
                  type="button"
                  onClick={() => fulfill.mutate(r.id)}
                  disabled={fulfill.isPending}
                  className="text-xs font-semibold text-accent disabled:opacity-60"
                >
                  {fulfill.isPending ? t("rewards.fulfilling") : t("rewards.fulfill")}
                </button>
              ) : (
                "—"
              ),
          },
        ]}
      />
    </div>
  );
}
