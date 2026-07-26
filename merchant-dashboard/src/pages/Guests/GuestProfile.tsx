import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getGuestDetail, updateGuest } from "../../lib/apiClient";
import { DataTable } from "../../components/DataTable";

type Tab = "visits" | "transactions" | "redemptions" | "reviews";

export default function GuestProfile() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("visits");
  const [editing, setEditing] = useState(false);

  const { data } = useQuery({ queryKey: ["guest", id], queryFn: () => getGuestDetail(id) });

  const [form, setForm] = useState({ name: "", email: "" });

  const saveMutation = useMutation({
    mutationFn: () => updateGuest(id, { name: form.name || null, email: form.email || null }),
    onSuccess: () => {
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["guest", id] });
    },
  });

  if (!data) return null;

  const { guest, visits, transactions, redemptions, reviews } = data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between rounded-xl2 border border-border bg-white p-5">
        <div>
          {editing ? (
            <div className="flex flex-col gap-2">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t("common.name")}
                className="rounded-lg border border-border px-3 py-1.5 text-sm"
              />
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={t("common.email")}
                className="rounded-lg border border-border px-3 py-1.5 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => saveMutation.mutate()}
                  className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white"
                >
                  {t("common.save")}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="rounded-full border border-border px-3 py-1 text-xs">
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-primary">{guest.name ?? guest.phone}</h1>
              <p className="text-sm text-mutedForeground">{guest.phone}</p>
              {guest.email && <p className="text-sm text-mutedForeground">{guest.email}</p>}
              <button
                type="button"
                onClick={() => {
                  setForm({ name: guest.name ?? "", email: guest.email ?? "" });
                  setEditing(true);
                }}
                className="mt-2 text-xs font-semibold text-accent"
              >
                {t("guests.editProfile")}
              </button>
            </>
          )}
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-xs text-mutedForeground">{t("guests.visits")}</p>
            <p className="text-lg font-bold text-primary">{guest.totalVisits}</p>
          </div>
          <div>
            <p className="text-xs text-mutedForeground">{t("guests.boliBalance")}</p>
            <p className="text-lg font-bold text-accent">{guest.boliBalance}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 rounded-full bg-muted p-1 w-fit">
        {(["visits", "transactions", "redemptions", "reviews"] as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              tab === key ? "bg-white text-primary shadow-sm" : "text-mutedForeground"
            }`}
          >
            {t(`guests.tabs.${key}`)}
          </button>
        ))}
      </div>

      {tab === "visits" && (
        <DataTable
          rows={visits}
          keyField={(v) => v.id}
          emptyMessage={t("common.noResults")}
          columns={[
            { header: t("outlets.title"), render: (v) => v.outletName },
            { header: t("common.status"), render: (v) => new Date(v.checkedInAt).toLocaleString() },
            { header: t("rewards.boliCost"), render: (v) => `+${v.boliEarned}` },
          ]}
        />
      )}
      {tab === "transactions" && (
        <DataTable
          rows={transactions}
          keyField={(tx) => tx.id}
          emptyMessage={t("common.noResults")}
          columns={[
            { header: t("common.name"), render: (tx) => tx.note ?? tx.type },
            { header: t("common.status"), render: (tx) => new Date(tx.createdAt).toLocaleString() },
            { header: t("rewards.boliCost"), render: (tx) => (tx.amount >= 0 ? `+${tx.amount}` : tx.amount) },
          ]}
        />
      )}
      {tab === "redemptions" && (
        <DataTable
          rows={redemptions}
          keyField={(r) => r.id}
          emptyMessage={t("common.noResults")}
          columns={[
            { header: t("rewards.title"), render: (r) => r.rewardName },
            { header: t("common.status"), render: (r) => t(`rewards.redemptionStatus.${r.status}`) },
            { header: t("rewards.boliCost"), render: (r) => r.boliSpent },
          ]}
        />
      )}
      {tab === "reviews" && (
        <DataTable
          rows={reviews}
          keyField={(r) => r.id}
          emptyMessage={t("common.noResults")}
          columns={[
            { header: t("reviews.rating"), render: (r) => "★".repeat(r.rating) },
            { header: t("reviews.comment"), render: (r) => r.comment ?? "—" },
          ]}
        />
      )}
    </div>
  );
}
