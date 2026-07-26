import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ApiRequestError, submitReview } from "../lib/apiClient";

export default function ReviewSubmit() {
  const { t } = useTranslation();
  const { visitId = "" } = useParams();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const mutation = useMutation({
    mutationFn: () => submitReview(visitId, rating, comment || undefined),
  });

  if (mutation.isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <p className="text-lg font-semibold text-primary">{t("review.thankYou")}</p>
      </div>
    );
  }

  const alreadyReviewed = mutation.error instanceof ApiRequestError && mutation.error.status === 409;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-6 pb-28 pt-8">
      <h1 className="text-2xl font-extrabold text-primary">{t("review.title")}</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="flex flex-col gap-5"
      >
        <div>
          <p className="mb-2 text-sm font-medium text-primary">{t("review.ratingLabel")}</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)} aria-label={`${star} stars`}>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill={star <= rating ? "#0F766E" : "none"}
                  stroke={star <= rating ? "#0F766E" : "#CBD5E1"}
                  strokeWidth="1.5"
                >
                  <path d="M12 17.75 5.8 21l1.2-7-5-4.87 6.9-1L12 2l3.1 6.13 6.9 1-5 4.87 1.2 7Z" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-primary">{t("review.commentLabel")}</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("review.commentPlaceholder")}
            rows={4}
            className="rounded-xl2 border border-border px-4 py-3 text-base focus:border-accent"
          />
        </label>

        {alreadyReviewed && <p className="text-sm text-red-600">{t("review.alreadyReviewed")}</p>}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accentDark disabled:opacity-60"
        >
          {mutation.isPending ? t("review.submitting") : t("review.submit")}
        </button>
      </form>
    </div>
  );
}
