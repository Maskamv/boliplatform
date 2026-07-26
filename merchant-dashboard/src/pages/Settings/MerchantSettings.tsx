import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getMerchant, updateMerchant } from "../../lib/apiClient";

export default function MerchantSettings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["merchant"], queryFn: getMerchant });

  const [form, setForm] = useState({
    businessName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    boliEarnRate: 10,
  });

  useEffect(() => {
    if (data) {
      setForm({
        businessName: data.businessName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone ?? "",
        address: data.address ?? "",
        boliEarnRate: data.boliEarnRate,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: () =>
      updateMerchant({
        businessName: form.businessName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone || null,
        address: form.address || null,
        boliEarnRate: Number(form.boliEarnRate),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["merchant"] }),
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-primary">{t("settings.title")}</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="flex max-w-md flex-col gap-4 rounded-xl2 border border-border bg-white p-5"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-primary">{t("settings.businessName")}</span>
          <input
            required
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-primary">{t("settings.contactEmail")}</span>
          <input
            type="email"
            required
            value={form.contactEmail}
            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-primary">{t("settings.contactPhone")}</span>
          <input
            value={form.contactPhone}
            onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-primary">{t("settings.address")}</span>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-primary">{t("settings.boliEarnRate")}</span>
          <input
            type="number"
            min={1}
            value={form.boliEarnRate}
            onChange={(e) => setForm({ ...form, boliEarnRate: Number(e.target.value) })}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="self-start rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {mutation.isPending ? t("common.saving") : t("common.save")}
        </button>
      </form>
    </div>
  );
}
