export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl2 border border-border bg-white p-5">
      <p className="text-sm font-medium text-mutedForeground">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-primary">{value}</p>
    </div>
  );
}
