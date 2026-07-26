/**
 * CLI entrypoint for the automated-campaign engine — `npm run campaigns:run`.
 *
 * This is what a real scheduler (OS cron, node-cron, a hosted queue) would
 * invoke on an interval in production. Runs across every merchant since
 * there's no per-tenant scheduler wiring yet; pass a merchantId as argv[2]
 * to scope it to one merchant for testing.
 */
import { runDueCampaigns } from "../src/jobs/runDueCampaigns.js";
import { prisma } from "../src/db/client.js";

async function main() {
  const merchantId = process.argv[2];
  const result = await runDueCampaigns(merchantId);
  console.log(`Evaluated ${result.campaignsEvaluated} active campaign(s), sent ${result.messagesSent} message(s).`);
  for (const d of result.details) {
    console.log(`  - ${d.campaignName}: ${d.messagesSent} sent`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
