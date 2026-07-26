import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { deleteTier, listTiers } from "../../lib/apiClient";
import { DataTable } from "../../components/DataTable";
import { PATHS } from "../../router";

export default function TierList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data } = useQuery({ queryKey: ["tiers"], queryFn: listTiers });

  const remove = useMutation({
    mutationFn: (id: string) => deleteTier(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tiers"] }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-primary">{t("memberships.title")}</h1>
        <button
          type="button"
          onClick={() => navigate(PATHS.membershipNew)}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accentDark"
        >
          {t("memberships.addTier")}
        </button>
      </div>

      <DataTable
        rows={data ?? []}
        keyField={(tier) => tier.id}
        emptyMessage={t("common.noResults")}
        columns={[
          {
            header: t("common.name"),
            render: (tier) => (
              <span className="font-semibold" style={{ color: tier.badgeColor ?? undefined }}>
                {tier.name}
              </span>
            ),
          },
          { header: t("memberships.minVisits"), render: (tier) => tier.minVisits },
          { header: t("memberships.perks"), render: (tier) => tier.perks ?? "—" },
          {
            header: t("common.actions"),
            render: (tier) => (
              <div className="flex gap-3">
                <button type="button" onClick={() => navigate(PATHS.membershipEdit(tier.id))} className="text-xs font-semibold text-accent">
                  {t("common.edit")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(t("common.confirmDelete"))) remove.mutate(tier.id);
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
    </div>
  );
}
