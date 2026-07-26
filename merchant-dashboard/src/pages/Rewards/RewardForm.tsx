import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { createReward, listRewards, updateReward } from "../../lib/apiClient";
import { PATHS } from "../../router";

export default function RewardForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();

  const { data: rewards } = useQuery({ queryKey: ["rewards"], queryFn: listRewards, enabled: isEdit });
  const existing = rewards?.find((r) => r.id === id);

  const [form, setForm] = useState({ name: "", description: "", boliCost: 50, stock: "" });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        description: existing.description ?? "",
        boliCost: existing.boliCost,
        stock: existing.stock === null ? "" : String(existing.stock),
      });
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        description: form.description || null,
        boliCost: Number(form.boliCost),
        stock: form.stock === "" ? null : Number(form.stock),
      };
      return isEdit ? updateReward(id!, payload) : createReward(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      navigate(PATHS.rewards);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-primary">{isEdit ? t("rewards.form.titleEdit") : t("rewards.form.titleCreate")}</h1>

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
          <span className="text-sm font-medium text-primary">{t("rewards.description")}</span>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-primary">{t("rewards.boliCost")}</span>
          <input
            type="number"
            required
            min={1}
            value={form.boliCost}
            onChange={(e) => setForm({ ...form, boliCost: Number(e.target.value) })}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-primary">
            {t("rewards.stock")} <span className="text-mutedForeground">({t("rewards.unlimited")} if empty)</span>
          </span>
          <input
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>

        <div className="flex gap-3">
          <button type="submit" disabled={mutation.isPending} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white">
            {mutation.isPending ? t("common.saving") : t("common.save")}
          </button>
          <button type="button" onClick={() => navigate(PATHS.rewards)} className="rounded-full border border-border px-4 py-2 text-sm">
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
