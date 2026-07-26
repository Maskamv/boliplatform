import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { runDueCampaigns } from "../../lib/apiClient";

export function CampaignRunPanel() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [result, setResult] = useState<{ evaluated: number; sent: number } | null>(null);

  const mutation = useMutation({
    mutationFn: runDueCampaigns,
    onSuccess: (data) => {
      setResult({ evaluated: data.campaignsEvaluated, sent: data.messagesSent });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  return (
    <div className="flex items-center justify-between rounded-xl2 border border-accent/30 bg-accent/5 p-4">
      <div>
        <p className="text-sm font-semibold text-primary">{t("campaigns.runDue")}</p>
        {result && <p className="mt-1 text-sm text-mutedForeground">{t("campaigns.runResult", result)}</p>}
      </div>
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accentDark disabled:opacity-60"
      >
        {mutation.isPending ? t("campaigns.running") : t("campaigns.runDue")}
      </button>
    </div>
  );
}
