import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getMe } from "../lib/apiClient";
import { logout } from "../lib/auth";
import { PATHS } from "../router";

export function Topbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["me"], queryFn: getMe });

  return (
    <header className="flex items-center justify-between border-b border-border bg-white px-6 py-3">
      <div />
      <div className="flex items-center gap-4">
        {data && (
          <div className="text-right">
            <p className="text-sm font-semibold text-primary">{data.name}</p>
            <p className="text-xs text-mutedForeground">{t(`staff.roles.${data.role}`)}</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            logout();
            navigate(PATHS.login, { replace: true });
          }}
          className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:border-destructive hover:text-destructive"
        >
          {t("common.logout")}
        </button>
      </div>
    </header>
  );
}
