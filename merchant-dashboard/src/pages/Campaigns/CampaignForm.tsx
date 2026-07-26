import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { CampaignDto } from "@boli/shared";
import { createCampaign, listCampaigns, updateCampaign } from "../../lib/apiClient";
import { PATHS } from "../../router";

const TRIGGER_TYPES: CampaignDto["triggerType"][] = ["WELCOME", "BIRTHDAY", "WIN_BACK", "POST_VISIT"];
const CHANNELS: CampaignDto["channel"][] = ["WHATSAPP", "SMS"];
const STATUSES: CampaignDto["status"][] = ["DRAFT", "ACTIVE", "PAUSED"];

export default function CampaignForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();

  const { data: campaigns } = useQuery({ queryKey: ["campaigns"], queryFn: listCampaigns, enabled: isEdit });
  const existing = campaigns?.find((c) => c.id === id);

  const [form, setForm] = useState({
    name: "",
    triggerType: "WELCOME" as CampaignDto["triggerType"],
    channel: "WHATSAPP" as CampaignDto["channel"],
    status: "DRAFT" as CampaignDto["status"],
    messageTemplate: "Hi {{guestName}}, ",
    daysSinceLastVisit: 30,
    delayHours: 3,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        triggerType: existing.triggerType,
        channel: existing.channel,
        status: existing.status,
        messageTemplate: existing.messageTemplate,
        daysSinceLastVisit: (existing.triggerConfig.daysSinceLastVisit as number) ?? 30,
        delayHours: (existing.triggerConfig.delayHours as number) ?? 3,
      });
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: () => {
      const triggerConfig: Record<string, unknown> =
        form.triggerType === "WIN_BACK"
          ? { daysSinceLastVisit: Number(form.daysSinceLastVisit) }
          : form.triggerType === "POST_VISIT"
            ? { delayHours: Number(form.delayHours) }
            : {};

      const payload = {
        name: form.name,
        triggerType: form.triggerType,
        channel: form.channel,
        status: form.status,
        messageTemplate: form.messageTemplate,
        triggerConfig,
      };
      return isEdit ? updateCampaign(id!, payload) : createCampaign(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      navigate(PATHS.campaigns);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-primary">{isEdit ? t("campaigns.form.titleEdit") : t("campaigns.form.titleCreate")}</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="flex max-w-lg flex-col gap-4 rounded-xl2 border border-border bg-white p-5"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-primary">{t("common.name")}</span>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-primary">{t("campaigns.trigger")}</span>
          <select
            value={form.triggerType}
            onChange={(e) => setForm({ ...form, triggerType: e.target.value as CampaignDto["triggerType"] })}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          >
            {TRIGGER_TYPES.map((tr) => (
              <option key={tr} value={tr}>
                {t(`campaigns.triggers.${tr}`)}
              </option>
            ))}
          </select>
        </label>

        {form.triggerType === "WIN_BACK" && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-primary">Days since last visit</span>
            <input
              type="number"
              min={1}
              value={form.daysSinceLastVisit}
              onChange={(e) => setForm({ ...form, daysSinceLastVisit: Number(e.target.value) })}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
        )}

        {form.triggerType === "POST_VISIT" && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-primary">Delay after visit (hours)</span>
            <input
              type="number"
              min={1}
              value={form.delayHours}
              onChange={(e) => setForm({ ...form, delayHours: Number(e.target.value) })}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-primary">{t("campaigns.channel")}</span>
          <select
            value={form.channel}
            onChange={(e) => setForm({ ...form, channel: e.target.value as CampaignDto["channel"] })}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          >
            {CHANNELS.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-primary">{t("common.status")}</span>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as CampaignDto["status"] })}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-primary">{t("campaigns.messageTemplate")}</span>
          <span className="text-xs text-mutedForeground">{t("campaigns.templateHint")}</span>
          <textarea
            required
            value={form.messageTemplate}
            onChange={(e) => setForm({ ...form, messageTemplate: e.target.value })}
            rows={3}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>

        <div className="flex gap-3">
          <button type="submit" disabled={mutation.isPending} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white">
            {mutation.isPending ? t("common.saving") : t("common.save")}
          </button>
          <button type="button" onClick={() => navigate(PATHS.campaigns)} className="rounded-full border border-border px-4 py-2 text-sm">
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
