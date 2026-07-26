import { useTranslation } from "react-i18next";
import type { RewardDto } from "@boli/shared";

interface RewardCardProps {
  reward: RewardDto;
  affordable: boolean;
  onRedeem: () => void;
  redeeming: boolean;
}

export function RewardCard({ reward, affordable, onRedeem, redeeming }: RewardCardProps) {
  const { t } = useTranslation();
  const outOfStock = reward.stock !== null && reward.stock <= 0;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl2 border border-border bg-white p-4">
      <div>
        <p className="font-semibold text-primary">{reward.name}</p>
        {reward.description && <p className="mt-0.5 text-sm text-mutedForeground">{reward.description}</p>}
        <p className="mt-1 text-sm font-medium text-accent">{t("rewards.cost", { cost: reward.boliCost })}</p>
      </div>
      <button
        type="button"
        disabled={!affordable || outOfStock || redeeming}
        onClick={onRedeem}
        className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accentDark disabled:cursor-not-allowed disabled:bg-muted disabled:text-mutedForeground"
      >
        {outOfStock
          ? t("rewards.outOfStock")
          : redeeming
            ? t("rewards.redeeming")
            : affordable
              ? t("rewards.redeem")
              : t("rewards.insufficientBalance")}
      </button>
    </div>
  );
}
