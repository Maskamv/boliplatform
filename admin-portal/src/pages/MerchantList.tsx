import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listMerchants } from "../lib/apiClient";
import { PATHS } from "../router";

export default function MerchantList() {
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["merchants"], queryFn: listMerchants });

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-primary">Merchants</h1>
        <button
          type="button"
          onClick={() => navigate(PATHS.merchantNew)}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accentDark"
        >
          Add merchant
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl2 border border-border bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-border bg-muted/60">
            <tr>
              <th className="px-4 py-3 font-semibold text-secondary">Business</th>
              <th className="px-4 py-3 font-semibold text-secondary">Contact email</th>
              <th className="px-4 py-3 font-semibold text-secondary">Boli/visit</th>
              <th className="px-4 py-3 font-semibold text-secondary">Status</th>
              <th className="px-4 py-3 font-semibold text-secondary">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((m) => (
              <tr
                key={m.id}
                onClick={() => navigate(PATHS.merchantDetail(m.id))}
                className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/40"
              >
                <td className="px-4 py-3 font-medium text-primary">{m.businessName}</td>
                <td className="px-4 py-3 text-primary">{m.contactEmail}</td>
                <td className="px-4 py-3 text-primary">{m.boliEarnRate}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      m.isActive ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {m.isActive ? "Active" : "Suspended"}
                  </span>
                </td>
                <td className="px-4 py-3 text-primary">{new Date(m.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {data && data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-mutedForeground">
                  No merchants yet — add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
