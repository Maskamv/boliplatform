import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FeatureKey } from "@boli/shared";
import { FEATURE_KEYS } from "@boli/shared";
import { getMerchant, getMerchantFeatures, reactivateMerchant, suspendMerchant, updateMerchantFeatures } from "../lib/apiClient";

const FEATURE_LABELS: Record<FeatureKey, string> = {
  crmEnabled: "Guest CRM",
  loyaltyEnabled: "Boli Rewards",
  whatsappMarketingEnabled: "WhatsApp Marketing",
  campaignsEnabled: "Automated Campaigns",
  qrCodesEnabled: "Smart QR Codes",
  reviewsEnabled: "Reviews & Feedback",
  referralsEnabled: "Referral Marketing",
  membershipsEnabled: "Guest Memberships",
};

export default function MerchantDetail() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();

  const merchantQuery = useQuery({ queryKey: ["merchant", id], queryFn: () => getMerchant(id) });
  const featuresQuery = useQuery({ queryKey: ["merchant-features", id], queryFn: () => getMerchantFeatures(id) });

  const suspendMutation = useMutation({
    mutationFn: () => (merchantQuery.data?.isActive ? suspendMerchant(id) : reactivateMerchant(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant", id] });
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
    },
  });

  const featureMutation = useMutation({
    mutationFn: (patch: Partial<Record<FeatureKey, boolean>>) => updateMerchantFeatures(id, patch),
    onSuccess: (data) => queryClient.setQueryData(["merchant-features", id], data),
  });

  if (!merchantQuery.data) return null;
  const merchant = merchantQuery.data;

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="flex items-start justify-between rounded-xl2 border border-border bg-white p-6">
        <div>
          <h1 className="text-xl font-bold text-primary">{merchant.businessName}</h1>
          <p className="text-sm text-mutedForeground">{merchant.contactEmail}</p>
          {merchant.contactPhone && <p className="text-sm text-mutedForeground">{merchant.contactPhone}</p>}
          {merchant.address && <p className="text-sm text-mutedForeground">{merchant.address}</p>}
          <p className="mt-2 text-xs text-mutedForeground">
            Boli/visit: {merchant.boliEarnRate} · Joined {new Date(merchant.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              merchant.isActive ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
            }`}
          >
            {merchant.isActive ? "Active" : "Suspended"}
          </span>
          <button
            type="button"
            onClick={() => suspendMutation.mutate()}
            disabled={suspendMutation.isPending}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold disabled:opacity-60 ${
              merchant.isActive ? "border-destructive text-destructive" : "border-accent text-accent"
            }`}
          >
            {merchant.isActive ? "Suspend business" : "Reactivate business"}
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-xl2 border border-border bg-white p-6">
        <p className="text-sm font-bold uppercase tracking-wide text-mutedForeground">Features</p>
        <p className="mt-1 text-sm text-mutedForeground">Turn individual features on or off for this business.</p>

        {featuresQuery.data && (
          <div className="mt-4 flex flex-col gap-3">
            {FEATURE_KEYS.map((key) => (
              <label key={key} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <span className="text-sm font-medium text-primary">{FEATURE_LABELS[key]}</span>
                <input
                  type="checkbox"
                  checked={featuresQuery.data[key]}
                  onChange={(e) => featureMutation.mutate({ [key]: e.target.checked })}
                  className="h-5 w-5 accent-accent"
                />
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
