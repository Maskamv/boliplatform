import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { listReviews, respondToReview } from "../../lib/apiClient";

export default function ReviewList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [responding, setResponding] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  const { data } = useQuery({ queryKey: ["reviews"], queryFn: listReviews });

  const mutation = useMutation({
    mutationFn: (id: string) => respondToReview(id, responseText),
    onSuccess: () => {
      setResponding(null);
      setResponseText("");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-primary">{t("reviews.title")}</h1>

      <div className="flex flex-col gap-3">
        {(data ?? []).map((review) => (
          <div key={review.id} className="rounded-xl2 border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-primary">{review.guestName}</p>
                <p className="text-xs text-mutedForeground">
                  {review.outletName} · {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className="text-accent">{"★".repeat(review.rating)}</span>
            </div>
            {review.comment && <p className="mt-2 text-sm text-secondary">{review.comment}</p>}

            {review.staffResponse ? (
              <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm text-secondary">
                <span className="font-semibold text-primary">{t("reviews.yourResponse")}: </span>
                {review.staffResponse}
              </p>
            ) : responding === review.id ? (
              <div className="mt-3 flex flex-col gap-2">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder={t("reviews.respondPlaceholder")}
                  rows={2}
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => mutation.mutate(review.id)}
                    disabled={mutation.isPending || !responseText.trim()}
                    className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white"
                  >
                    {mutation.isPending ? t("reviews.responding") : t("reviews.respond")}
                  </button>
                  <button type="button" onClick={() => setResponding(null)} className="rounded-full border border-border px-3 py-1 text-xs">
                    {t("common.cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setResponding(review.id)} className="mt-3 text-xs font-semibold text-accent">
                {t("reviews.respond")}
              </button>
            )}
          </div>
        ))}
        {(!data || data.length === 0) && <p className="text-sm text-mutedForeground">{t("common.noResults")}</p>}
      </div>
    </div>
  );
}
