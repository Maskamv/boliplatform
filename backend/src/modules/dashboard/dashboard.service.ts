import { prisma } from "../../db/client.js";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function getDashboardSummary(merchantId: string) {
  const since30d = new Date(Date.now() - THIRTY_DAYS_MS);

  const [totalGuests, visits30d, txns30d, activeCampaigns, pendingRedemptions] = await Promise.all([
    prisma.guest.count({ where: { merchantId } }),
    prisma.visit.count({ where: { outlet: { merchantId }, checkedInAt: { gte: since30d } } }),
    prisma.boliTransaction.findMany({
      where: { guest: { merchantId }, createdAt: { gte: since30d } },
      select: { type: true, amount: true },
    }),
    prisma.campaign.count({ where: { merchantId, status: "ACTIVE" } }),
    prisma.redemption.count({ where: { guest: { merchantId }, status: "PENDING" } }),
  ]);

  const boliIssued30d = txns30d.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const boliRedeemed30d = txns30d.filter((t) => t.type === "REDEEM").reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return {
    totalGuests,
    totalVisits30d: visits30d,
    boliIssued30d,
    boliRedeemed30d,
    activeCampaigns,
    pendingRedemptions,
  };
}

export async function getVisitsTimeseries(merchantId: string, days = 14) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const visits = await prisma.visit.findMany({
    where: { outlet: { merchantId }, checkedInAt: { gte: since } },
    select: { checkedInAt: true },
  });

  const counts = new Map<string, number>();
  for (let i = 0; i < days; i += 1) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    counts.set(d.toISOString().slice(0, 10), 0);
  }
  for (const v of visits) {
    const key = v.checkedInAt.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, visits: count }));
}
