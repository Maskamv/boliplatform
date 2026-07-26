import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiRequestError, createMerchant } from "../lib/apiClient";
import { PATHS } from "../router";

export default function MerchantNew() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    businessName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    boliEarnRate: 10,
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      createMerchant({
        businessName: form.businessName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone || null,
        address: form.address || null,
        boliEarnRate: Number(form.boliEarnRate),
        ownerName: form.ownerName,
        ownerEmail: form.ownerEmail,
        ownerPassword: form.ownerPassword,
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      navigate(PATHS.merchantDetail(result.merchant.id));
    },
  });

  const errorMessage = mutation.error instanceof ApiRequestError ? mutation.error.message : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-extrabold text-primary">Add merchant</h1>
      <p className="mt-1 text-sm text-mutedForeground">
        Onboards a new business and creates its first owner login in one step.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="mt-6 flex flex-col gap-6 rounded-xl2 border border-border bg-white p-6"
      >
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-mutedForeground">Business</p>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-primary">Business name</span>
              <input
                required
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-primary">Contact email</span>
              <input
                type="email"
                required
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-primary">Contact phone</span>
              <input
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-primary">Address</span>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-primary">Boli earned per visit</span>
              <input
                type="number"
                min={1}
                required
                value={form.boliEarnRate}
                onChange={(e) => setForm({ ...form, boliEarnRate: Number(e.target.value) })}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-mutedForeground">First owner login</p>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-primary">Owner name</span>
              <input
                required
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-primary">Owner email</span>
              <input
                type="email"
                required
                value={form.ownerEmail}
                onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-primary">Temporary password</span>
              <input
                type="text"
                required
                minLength={8}
                value={form.ownerPassword}
                onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
            </label>
          </div>
        </div>

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {mutation.isPending ? "Creating..." : "Create merchant"}
          </button>
          <button type="button" onClick={() => navigate(PATHS.merchants)} className="rounded-full border border-border px-5 py-2.5 text-sm">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
