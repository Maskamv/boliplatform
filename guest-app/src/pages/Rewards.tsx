import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getProfile, getRewardsCatalog, redeemReward } from "../lib/apiClient";
import { RewardCard } from "../components/RewardCard";

export default function Rewards() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const rewardsQuery = useQuery({ queryKey: ["rewards-catalog"], queryFn: getRewardsCatalog });

  const redeemMutation = useMutation({
    mutationFn: (rewardId: string) => {
      setRedeemingId(rewardId);
      return redeemReward(rewardId);
    },
    onSuccess: () => {
      setMessage(t("rewards.redeemSuccess"));
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["rewards-catalog"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onSettled: () => setRedeemingId(null),
  });

  const balance = profileQuery.data?.boliBalance ?? 0;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-6 pb-28 pt-8">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">{t("rewards.title")}</h1>
        <p className="mt-1 text-mutedForeground">{t("rewards.subtitle")}</p>
      </div>

      {message && <p className="rounded-xl2 bg-accent/10 px-4 py-3 text-sm font-medium text-accent">{message}</p>}

      {rewardsQuery.data && rewardsQuery.data.length > 0 ? (
        <div className="flex flex-col gap-3">
          {rewardsQuery.data.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              affordable={balance >= reward.boliCost}
              redeeming={redeemingId === reward.id}
              onRedeem={() => redeemMutation.mutate(reward.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-mutedForeground">{t("rewards.empty")}</p>
      )}
    </div>
  );
}
