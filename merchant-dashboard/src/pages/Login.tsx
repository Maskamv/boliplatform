import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { login } from "../lib/apiClient";
import { setStaffToken } from "../lib/auth";
import { PATHS } from "../router";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: ({ token }) => {
      setStaffToken(token);
      navigate(PATHS.dashboard, { replace: true });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm rounded-xl2 border border-border bg-white p-8">
        <div className="mb-6 flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <ellipse cx="14" cy="14" rx="12" ry="7.5" fill="#0F766E" />
            <g stroke="#fff" strokeWidth="1.2" strokeLinecap="round">
              <line x1="6.5" y1="14" x2="6.5" y2="10.8" />
              <line x1="9" y1="14" x2="9" y2="9.6" />
              <line x1="11.5" y1="14" x2="11.5" y2="9" />
              <line x1="14" y1="14" x2="14" y2="8.7" />
              <line x1="16.5" y1="14" x2="16.5" y2="9" />
              <line x1="19" y1="14" x2="19" y2="9.6" />
              <line x1="21.5" y1="14" x2="21.5" y2="10.8" />
            </g>
          </svg>
          <span className="text-lg font-extrabold text-primary">{t("app.name")}</span>
        </div>

        <h1 className="text-xl font-bold text-primary">{t("login.title")}</h1>
        <p className="mt-1 text-sm text-mutedForeground">{t("login.subtitle")}</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="mt-6 flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-primary">{t("login.email")}</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl2 border border-border px-3 py-2.5 text-sm focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-primary">{t("login.password")}</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl2 border border-border px-3 py-2.5 text-sm focus:border-accent"
            />
          </label>

          {mutation.isError && <p className="text-sm text-destructive">{(mutation.error as Error).message}</p>}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="mt-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accentDark disabled:opacity-60"
          >
            {mutation.isPending ? t("login.loggingIn") : t("login.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
