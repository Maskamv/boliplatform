import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { StaffUserDto } from "@boli/shared";
import { createStaff, deleteStaff, listStaff, updateStaff } from "../../lib/apiClient";
import { DataTable } from "../../components/DataTable";

const ROLES: StaffUserDto["role"][] = ["OWNER", "MANAGER", "STAFF"];

export default function StaffList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STAFF" as StaffUserDto["role"] });

  const { data } = useQuery({ queryKey: ["staff"], queryFn: listStaff });

  const createMutation = useMutation({
    mutationFn: () => createStaff(form),
    onSuccess: () => {
      setShowForm(false);
      setForm({ name: "", email: "", password: "", role: "STAFF" });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => updateStaff(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteStaff(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff"] }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-primary">{t("staff.title")}</h1>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accentDark"
        >
          {t("staff.addStaff")}
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
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-mutedForeground">{t("common.email")}</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-mutedForeground">{t("staff.form.password")}</span>
            <input
              type="text"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-mutedForeground">{t("staff.role")}</span>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as StaffUserDto["role"] })}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {t(`staff.roles.${role}`)}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={createMutation.isPending} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white">
            {createMutation.isPending ? t("common.creating") : t("common.create")}
          </button>
        </form>
      )}

      <DataTable
        rows={data ?? []}
        keyField={(s) => s.id}
        emptyMessage={t("common.noResults")}
        columns={[
          { header: t("common.name"), render: (s) => s.name },
          { header: t("common.email"), render: (s) => s.email },
          { header: t("staff.role"), render: (s) => t(`staff.roles.${s.role}`) },
          { header: t("common.status"), render: (s) => (s.isActive ? t("common.active") : t("common.inactive")) },
          {
            header: t("common.actions"),
            render: (s) => (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => toggleActive.mutate({ id: s.id, isActive: !s.isActive })}
                  className="text-xs font-semibold text-secondary"
                >
                  {s.isActive ? t("common.inactive") : t("common.active")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(t("common.confirmDelete"))) remove.mutate(s.id);
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
