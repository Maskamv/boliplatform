import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { createOutlet, listOutlets } from "../../lib/apiClient";
import { DataTable } from "../../components/DataTable";
import { PATHS } from "../../router";

export default function OutletList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const { data } = useQuery({ queryKey: ["outlets"], queryFn: listOutlets });

  const createMutation = useMutation({
    mutationFn: () => createOutlet({ name, address: address || null }),
    onSuccess: () => {
      setShowForm(false);
      setName("");
      setAddress("");
      queryClient.invalidateQueries({ queryKey: ["outlets"] });
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-primary">{t("outlets.title")}</h1>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accentDark"
        >
          {t("outlets.addOutlet")}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="flex flex-wrap items-end gap-3 rounded-xl2 border border-border bg-white p-4"
        >
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-mutedForeground">{t("common.name")}</span>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-mutedForeground">{t("outlets.address")}</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm" />
          </label>
          <button type="submit" disabled={createMutation.isPending} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white">
            {createMutation.isPending ? t("common.creating") : t("common.create")}
          </button>
        </form>
      )}

      <DataTable
        rows={data ?? []}
        keyField={(o) => o.id}
        emptyMessage={t("common.noResults")}
        onRowClick={(o) => navigate(PATHS.outletDetail(o.id))}
        columns={[
          { header: t("common.name"), render: (o) => o.name },
          { header: t("outlets.address"), render: (o) => o.address ?? "—" },
          { header: t("common.status"), render: (o) => (o.isActive ? t("common.active") : t("common.inactive")) },
        ]}
      />
    </div>
  );
}
