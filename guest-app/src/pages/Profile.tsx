import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getProfile, updateProfile } from "../lib/apiClient";
import { logout } from "../lib/auth";
import { resizeImageToDataUrl } from "../lib/resizeImage";
import { PhoneChangeCard } from "../components/PhoneChangeCard";
import { PATHS } from "../router";

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data } = useQuery({ queryKey: ["profile"], queryFn: getProfile });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: () => updateProfile({ name: form.name || null, email: form.email || null }),
    onSuccess: () => {
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const avatarMutation = useMutation({
    mutationFn: (avatarUrl: string) => updateProfile({ avatarUrl }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });

  async function handleAvatarSelected(file: File) {
    setAvatarError(null);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      avatarMutation.mutate(dataUrl);
    } catch {
      setAvatarError(t("profile.photoError"));
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-6 pb-28 pt-8">
      <h1 className="text-2xl font-extrabold text-primary">{t("profile.title")}</h1>

      {data && (
        <div className="rounded-xl2 border border-border bg-white p-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border bg-muted"
              aria-label={t("profile.changePhoto")}
            >
              {data.avatarUrl ? (
                <img src={data.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xl font-bold text-mutedForeground">
                  {(data.name ?? data.phone).slice(0, 1).toUpperCase()}
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                {avatarMutation.isPending ? "..." : t("profile.changePhoto")}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarSelected(file);
                e.target.value = "";
              }}
            />

            <div className="min-w-0 flex-1">
              {editing ? (
                <div className="flex flex-col gap-2">
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t("profile.name")}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm"
                  />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder={t("profile.email")}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm"
                  />
                </div>
              ) : (
                <>
                  <p className="truncate text-lg font-bold text-primary">{data.name ?? t("profile.noName")}</p>
                  <p className="truncate text-sm text-mutedForeground">{data.email ?? t("profile.noEmail")}</p>
                </>
              )}
            </div>
          </div>

          {avatarError && <p className="mt-2 text-xs text-red-600">{avatarError}</p>}

          <p className="mt-3 text-xs text-mutedForeground">
            {t("profile.memberSince", { date: new Date(data.createdAt).toLocaleDateString() })}
          </p>

          {editing ? (
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                {saveMutation.isPending ? t("common.saving") : t("common.save")}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="rounded-full border border-border px-4 py-1.5 text-xs">
                {t("common.cancel")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setForm({ name: data.name ?? "", email: data.email ?? "" });
                setEditing(true);
              }}
              className="mt-4 text-xs font-semibold text-accent"
            >
              {t("profile.editProfile")}
            </button>
          )}
        </div>
      )}

      {data && <PhoneChangeCard currentPhone={data.phone} />}

      <button
        type="button"
        onClick={() => {
          logout();
          navigate(PATHS.login, { replace: true });
        }}
        className="rounded-full border border-border px-6 py-3 font-semibold text-primary transition-colors hover:border-red-300 hover:text-red-600"
      >
        {t("profile.logout")}
      </button>
    </div>
  );
}
