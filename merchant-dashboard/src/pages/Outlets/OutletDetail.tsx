import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getOutlet, getOutletQrCode, regenerateOutletQrCode, updateOutlet } from "../../lib/apiClient";
import { QrCodeDisplay } from "../../components/QrCodeDisplay";

export default function OutletDetail() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const queryClient = useQueryClient();

  const outletQuery = useQuery({ queryKey: ["outlet", id], queryFn: () => getOutlet(id) });
  const qrQuery = useQuery({ queryKey: ["outlet-qr", id], queryFn: () => getOutletQrCode(id) });

  const toggleActiveMutation = useMutation({
    mutationFn: () => updateOutlet(id, { isActive: !outletQuery.data?.isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outlet", id] }),
  });

  const regenerateMutation = useMutation({
    mutationFn: () => regenerateOutletQrCode(id),
    onSuccess: (data) => queryClient.setQueryData(["outlet-qr", id], data),
  });

  if (!outletQuery.data) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between rounded-xl2 border border-border bg-white p-5">
        <div>
          <h1 className="text-xl font-bold text-primary">{outletQuery.data.name}</h1>
          <p className="text-sm text-mutedForeground">{outletQuery.data.address ?? "—"}</p>
        </div>
        <button
          type="button"
          onClick={() => toggleActiveMutation.mutate()}
          className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
            outletQuery.data.isActive ? "border-destructive text-destructive" : "border-accent text-accent"
          }`}
        >
          {outletQuery.data.isActive ? t("common.inactive") : t("common.active")}
        </button>
      </div>

      {qrQuery.data && (
        <QrCodeDisplay
          dataUrl={qrQuery.data.dataUrl}
          scanUrl={qrQuery.data.scanUrl}
          onRegenerate={() => regenerateMutation.mutate()}
          regenerating={regenerateMutation.isPending}
        />
      )}
    </div>
  );
}
