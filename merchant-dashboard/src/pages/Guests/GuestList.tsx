import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ApiRequestError, inviteGuest, listGuests } from "../../lib/apiClient";
import { DataTable } from "../../components/DataTable";
import { PATHS } from "../../router";

export default function GuestList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [joinUrl, setJoinUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data } = useQuery({ queryKey: ["guests", search], queryFn: () => listGuests(search || undefined) });

  const inviteMutation = useMutation({
    mutationFn: () => inviteGuest({ phone: invitePhone, name: inviteName || null }),
    onSuccess: (result) => {
      setJoinUrl(result.joinUrl);
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  const inviteError = inviteMutation.error instanceof ApiRequestError ? inviteMutation.error.message : null;

  function closeInvite() {
    setShowInvite(false);
    setInvitePhone("");
    setInviteName("");
    setJoinUrl(null);
    inviteMutation.reset();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-primary">{t("guests.title")}</h1>
        <button
          type="button"
          onClick={() => setShowInvite((s) => !s)}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accentDark"
        >
          {t("guests.inviteCustomer")}
        </button>
      </div>

      {showInvite && (
        <div className="rounded-xl2 border border-border bg-white p-4">
          {joinUrl ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-accent">{t("guests.inviteSent")}</p>
              <p className="text-xs text-mutedForeground">{t("guests.inviteSentHint")}</p>
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                <span className="flex-1 truncate text-sm text-primary">{joinUrl}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(joinUrl).catch(() => {});
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white"
                >
                  {copied ? t("common.copied") : t("common.copy")}
                </button>
              </div>
              <button type="button" onClick={closeInvite} className="self-start text-xs font-semibold text-secondary">
                {t("common.close")}
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                inviteMutation.mutate();
              }}
              className="flex flex-wrap items-end gap-3"
            >
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-mutedForeground">{t("common.phone")}</span>
                <input
                  required
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  placeholder="+960 7XXXXXX"
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-mutedForeground">{t("common.name")}</span>
                <input value={inviteName} onChange={(e) => setInviteName(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm" />
              </label>
              <button type="submit" disabled={inviteMutation.isPending} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white">
                {inviteMutation.isPending ? t("guests.sendingInvite") : t("guests.sendInvite")}
              </button>
              <button type="button" onClick={closeInvite} className="rounded-full border border-border px-4 py-2 text-sm">
                {t("common.cancel")}
              </button>
              {inviteError && <p className="w-full text-sm text-destructive">{inviteError}</p>}
            </form>
          )}
        </div>
      )}

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("guests.searchPlaceholder")}
        className="w-full max-w-sm rounded-xl2 border border-border px-4 py-2.5 text-sm focus:border-accent"
      />

      <DataTable
        rows={data ?? []}
        keyField={(g) => g.id}
        emptyMessage={t("common.noResults")}
        onRowClick={(g) => navigate(PATHS.guestDetail(g.id))}
        columns={[
          { header: t("common.name"), render: (g) => g.name ?? "—" },
          { header: t("common.phone"), render: (g) => g.phone },
          { header: t("guests.visits"), render: (g) => g.totalVisits },
          { header: t("guests.boliBalance"), render: (g) => g.boliBalance },
          { header: t("guests.lastVisit"), render: (g) => (g.lastVisitAt ? new Date(g.lastVisitAt).toLocaleDateString() : t("guests.never")) },
        ]}
      />
    </div>
  );
}
