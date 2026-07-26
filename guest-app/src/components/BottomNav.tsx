import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PATHS } from "../router";

function Icon({ path }: { path: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={path} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = {
  home: "M4 11.5 12 4l8 7.5M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9",
  rewards: "M12 17.75 5.8 21l1.2-7-5-4.87 6.9-1L12 2l3.1 6.13 6.9 1-5 4.87 1.2 7Z",
  membership: "M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM7.5 13.5 6 22l6-3 6 3-1.5-8.5",
  history: "M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 8v4l3 2",
  profile: "M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
};

export function BottomNav() {
  const { t } = useTranslation();

  const items: Array<{ to: string; label: string; icon: keyof typeof ICONS }> = [
    { to: PATHS.home, label: t("nav.home"), icon: "home" },
    { to: PATHS.rewards, label: t("nav.rewards"), icon: "rewards" },
    { to: PATHS.membership, label: t("nav.membership"), icon: "membership" },
    { to: PATHS.history, label: t("nav.history"), icon: "history" },
    { to: PATHS.profile, label: t("nav.profile"), icon: "profile" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === PATHS.home}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                isActive ? "text-accent" : "text-mutedForeground"
              }`
            }
          >
            <Icon path={ICONS[item.icon]} />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
