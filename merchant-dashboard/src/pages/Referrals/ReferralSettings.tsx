import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getReferralSettings, listReferrals, updateReferralSettings } from "../../lib/apiClient";
import { DataTable } from "../../components/DataTable";

export default function ReferralSettingsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({ queryKey: ["referral-settings"], queryFn: getReferralSettings });
  const referralsQuery = useQuery({ queryKey: ["referrals"], queryFn: listReferrals });

  const [form, setForm] = useState({ referrerBonusBoli: 50, refereeBonusBoli: 25 });

  useEffect(() => {
    if (settingsQuery.data) {
      setForm({ referrerBonusBoli: settingsQuery.data.referrerBonusBoli, refereeBonusBoli: settingsQuery.data.refereeBonusBoli });
    }
  }, [settingsQuery.data]);

  const mutation = useMutation({
    mutationFn: () => updateReferralSettings(form),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["referral-settings"] }),
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-primary">{t("referrals.title")}</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="flex max-w-md flex-wrap items-end gap-4 rounded-xl2 border border-border bg-white p-5"
      >
        <p className="w-full text-sm font-semibold text-primary">{t("referrals.settings")}</p>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-mutedForeground">{t("referrals.referrerBonus")}</span>
          <input
            type="number"
            min={0}
            value={form.referrerBonusBoli}
            onChange={(e) => setForm({ ...form, referrerBonusBoli: Number(e.target.value) })}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-mutedForeground">{t("referrals.refereeBonus")}</span>
          <input
            type="number"
            min={0}
            value={form.refereeBonusBoli}
            onChange={(e) => setForm({ ...form, refereeBonusBoli: Number(e.target.value) })}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <button type="submit" disabled={mutation.isPending} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white">
          {mutation.isPending ? t("common.saving") : t("common.save")}
        </button>
      </form>

      <DataTable
        rows={referralsQuery.data ?? []}
        keyField={(r) => r.id}
        emptyMessage={t("common.noResults")}
        columns={[
          { header: t("referrals.referrer"), render: (r) => r.referrerName },
          { header: t("referrals.referee"), render: (r) => r.refereeName },
          { header: t("common.status"), render: (r) => (r.status === "COMPLETED" ? t("referrals.completed") : t("referrals.pending")) },
          { header: t("rewards.boliCost"), render: (r) => (r.referrerRewardBoli ? `${r.referrerRewardBoli} / ${r.refereeRewardBoli}` : "—") },
        ]}
      />
    </div>
  );
}
