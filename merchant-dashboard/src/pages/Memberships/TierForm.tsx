import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { createTier, listTiers, updateTier } from "../../lib/apiClient";
import { PATHS } from "../../router";

export default function TierForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();

  const { data: tiers } = useQuery({ queryKey: ["tiers"], queryFn: listTiers, enabled: isEdit });
  const existing = tiers?.find((tier) => tier.id === id);

  const [form, setForm] = useState({ name: "", minVisits: 0, perks: "", badgeColor: "#0F766E" });

  useEffect(() => {
    if (existing) {
      setForm({ name: existing.name, minVisits: existing.minVisits, perks: existing.perks ?? "", badgeColor: existing.badgeColor ?? "#0F766E" });
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = { name: form.name, minVisits: Number(form.minVisits), perks: form.perks || null, badgeColor: form.badgeColor };
      return isEdit ? updateTier(id!, payload) : createTier(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiers"] });
      navigate(PATHS.memberships);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-primary">{isEdit ? t("memberships.form.titleEdit") : t("memberships.form.titleCreate")}</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="flex max-w-md flex-col gap-4 rounded-xl2 border border-border bg-white p-5"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-primary">{t("common.name")}</span>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-primary">{t("memberships.minVisits")}</span>
          <input
            type="number"
            required
            min={0}
            value={form.minVisits}
            onChange={(e) => setForm({ ...form, minVisits: Number(e.target.value) })}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-primary">{t("memberships.perks")}</span>
          <textarea value={form.perks} onChange={(e) => setForm({ ...form, perks: e.target.value })} rows={2} className="rounded-lg border border-border px-3 py-2 text-sm" />
        </label>
        <label className="flex items-center gap-3">
          <span className="text-sm font-medium text-primary">Badge color</span>
          <input type="color" value={form.badgeColor} onChange={(e) => setForm({ ...form, badgeColor: e.target.value })} className="h-9 w-14 rounded border border-border" />
        </label>

        <div className="flex gap-3">
          <button type="submit" disabled={mutation.isPending} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white">
            {mutation.isPending ? t("common.saving") : t("common.save")}
          </button>
          <button type="button" onClick={() => navigate(PATHS.memberships)} className="rounded-full border border-border px-4 py-2 text-sm">
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
