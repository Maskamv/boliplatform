interface TierProgressBarProps {
  totalVisits: number;
  currentTierMinVisits: number;
  nextTierMinVisits: number | null;
}

export function TierProgressBar({ totalVisits, currentTierMinVisits, nextTierMinVisits }: TierProgressBarProps) {
  if (nextTierMinVisits === null) {
    return <div className="h-2 w-full rounded-full bg-accent" />;
  }

  const span = Math.max(1, nextTierMinVisits - currentTierMinVisits);
  const progress = Math.min(1, Math.max(0, (totalVisits - currentTierMinVisits) / span));

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress * 100}%` }} />
    </div>
  );
}
