import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { deleteCampaign, listCampaigns, updateCampaign } from "../../lib/apiClient";
import { DataTable } from "../../components/DataTable";
import { PATHS } from "../../router";
import { CampaignRunPanel } from "./CampaignRunPanel";

export default function CampaignList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data } = useQuery({ queryKey: ["campaigns"], queryFn: listCampaigns });

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACTIVE" | "PAUSED" }) => updateCampaign(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-primary">{t("campaigns.title")}</h1>
        <button
          type="button"
          onClick={() => navigate(PATHS.campaignNew)}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accentDark"
        >
          {t("campaigns.addCampaign")}
        </button>
      </div>

      <CampaignRunPanel />

      <DataTable
        rows={data ?? []}
        keyField={(c) => c.id}
        emptyMessage={t("common.noResults")}
        columns={[
          { header: t("common.name"), render: (c) => c.name },
          { header: t("campaigns.trigger"), render: (c) => t(`campaigns.triggers.${c.triggerType}`) },
          { header: t("campaigns.channel"), render: (c) => c.channel },
          { header: t("common.status"), render: (c) => c.status },
          { header: t("campaigns.lastRun"), render: (c) => (c.lastRunAt ? new Date(c.lastRunAt).toLocaleString() : t("campaigns.neverRun")) },
          {
            header: t("common.actions"),
            render: (c) => (
              <div className="flex gap-3">
                <button type="button" onClick={() => navigate(PATHS.campaignEdit(c.id))} className="text-xs font-semibold text-accent">
                  {t("common.edit")}
                </button>
                <button
                  type="button"
                  onClick={() => toggleStatus.mutate({ id: c.id, status: c.status === "ACTIVE" ? "PAUSED" : "ACTIVE" })}
                  className="text-xs font-semibold text-secondary"
                >
                  {c.status === "ACTIVE" ? t("common.inactive") : t("common.active")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(t("common.confirmDelete"))) remove.mutate(c.id);
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
