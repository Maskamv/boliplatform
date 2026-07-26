import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../lib/apiClient";
import { logout } from "../lib/auth";
import { PATHS } from "../router";

export function Topbar() {
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["me"], queryFn: getMe });

  return (
    <header className="flex items-center justify-between border-b border-border bg-white px-6 py-4">
      <Link to={PATHS.merchants} className="flex items-center gap-2">
        <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
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
        <span className="text-lg font-extrabold text-primary">Boli Platform Admin</span>
      </Link>

      <div className="flex items-center gap-4">
        {data && <span className="text-sm font-medium text-secondary">{data.name}</span>}
        <button
          type="button"
          onClick={() => {
            logout();
            navigate(PATHS.login, { replace: true });
          }}
          className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:border-destructive hover:text-destructive"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
