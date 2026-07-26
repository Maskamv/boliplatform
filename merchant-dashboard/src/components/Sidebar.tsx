import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PATHS } from "../router";

function Icon({ path }: { path: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <path d={path} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS: Record<string, string> = {
  dashboard: "M4 13h6V4H4v9ZM14 20h6v-9h-6v9ZM4 20h6v-5H4v5ZM14 10h6V4h-6v6Z",
  guests: "M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM21 20v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  outlets: "M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6",
  rewards: "M12 17.75 5.8 21l1.2-7-5-4.87 6.9-1L12 2l3.1 6.13 6.9 1-5 4.87 1.2 7Z",
  memberships: "M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  campaigns: "M3 11l18-7-7 18-2.5-7.5L3 11Z",
  messages: "M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 20l1.05-5.4A8.5 8.5 0 1 1 21 11.5Z",
  reviews: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z",
  referrals: "M6 12h.01M18 6h.01M18 18h.01M8.6 10.5l6.9-3.4M8.6 13.5l6.9 3.4M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM20 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
  staff: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.36.4.66.75.85.32.18.5.5.5.9v.5c0 .4-.18.72-.5.9-.35.19-.6.49-.75.85Z",
};

export function Sidebar() {
  const { t } = useTranslation();

  const items: Array<{ to: string; label: string; icon: string }> = [
    { to: PATHS.dashboard, label: t("nav.dashboard"), icon: "dashboard" },
    { to: PATHS.guests, label: t("nav.guests"), icon: "guests" },
    { to: PATHS.outlets, label: t("nav.outlets"), icon: "outlets" },
    { to: PATHS.rewards, label: t("nav.rewards"), icon: "rewards" },
    { to: PATHS.memberships, label: t("nav.memberships"), icon: "memberships" },
    { to: PATHS.campaigns, label: t("nav.campaigns"), icon: "campaigns" },
    { to: PATHS.messages, label: t("nav.messages"), icon: "messages" },
    { to: PATHS.reviews, label: t("nav.reviews"), icon: "reviews" },
    { to: PATHS.referrals, label: t("nav.referrals"), icon: "referrals" },
    { to: PATHS.staff, label: t("nav.staff"), icon: "staff" },
    { to: PATHS.settings, label: t("nav.settings"), icon: "settings" },
  ];

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-white md:flex md:flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
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
        <span className="text-lg font-extrabold text-primary">Boli</span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === PATHS.dashboard}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl2 px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-accent/10 text-accent" : "text-secondary hover:bg-muted"
              }`
            }
          >
            <Icon path={ICONS[item.icon]} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
