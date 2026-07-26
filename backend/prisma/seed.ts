import { PrismaClient } from "@prisma/client";
import { applyBoliTransaction } from "../src/lib/boli.js";
import { evaluateMembershipTierForGuest } from "../src/lib/membership.js";
import { hashPassword } from "../src/lib/password.js";
import { buildScanUrl } from "../src/lib/qrcode.js";

const prisma = new PrismaClient();

const SEED_PASSWORD = "Password123!";
const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY_MS);

async function seedVisit(guestId: string, outletId: string, outletName: string, boliEarned: number, checkedInAt: Date) {
  const visit = await prisma.visit.create({
    data: { guestId, outletId, source: "QR_SCAN", boliEarned, checkedInAt },
  });
  // Backdated seed visits aren't necessarily created in chronological order
  // (see the guest histories below), so guard against an older visit
  // clobbering a newer lastVisitAt — real checkins never hit this since
  // they're always "now", but seeding needs the explicit max.
  const current = await prisma.guest.findUniqueOrThrow({ where: { id: guestId }, select: { lastVisitAt: true } });
  const nextLastVisitAt = !current.lastVisitAt || checkedInAt > current.lastVisitAt ? checkedInAt : current.lastVisitAt;
  await prisma.guest.update({ where: { id: guestId }, data: { totalVisits: { increment: 1 }, lastVisitAt: nextLastVisitAt } });
  await applyBoliTransaction(prisma, {
    guestId,
    type: "EARN",
    amount: boliEarned,
    relatedVisitId: visit.id,
    note: `Visit at ${outletName}`,
  });
  return visit;
}

async function signupGuest(merchantId: string, phone: string, name: string, opts: { dateOfBirth?: Date } = {}) {
  const guest = await prisma.guest.create({
    data: { merchantId, phone, name, dateOfBirth: opts.dateOfBirth },
  });
  await applyBoliTransaction(prisma, {
    guestId: guest.id,
    type: "SIGNUP_BONUS",
    amount: 20,
    note: "Welcome bonus for joining",
  });
  return guest;
}

async function main() {
  const existing = await prisma.merchant.findFirst({ select: { id: true } });
  if (existing) {
    console.log("Seed data already present — skipping (safe to re-run on every deploy).");
    return;
  }

  console.log("Seeding Boli demo data...\n");

  // --- Merchant ---
  const merchant = await prisma.merchant.create({
    data: {
      businessName: "Thundi Café",
      slug: "thundi-cafe",
      contactEmail: "hello@thundi.mv",
      contactPhone: "+9607700000",
      address: "Boduthakurufaanu Magu, Malé, Maldives",
      defaultLanguage: "en",
      currency: "MVR",
      boliEarnRate: 10,
    },
  });

  // --- Outlets ---
  const maleOutlet = await prisma.outlet.create({
    data: { merchantId: merchant.id, name: "Thundi Café — Malé", slug: "male" },
  });
  const hulhumaleOutlet = await prisma.outlet.create({
    data: { merchantId: merchant.id, name: "Thundi Café — Hulhumalé", slug: "hulhumale" },
  });

  // --- Staff ---
  const passwordHash = await hashPassword(SEED_PASSWORD);
  await prisma.staffUser.create({
    data: { merchantId: merchant.id, name: "Ismail Nasih", email: "owner@thundi.mv", passwordHash, role: "OWNER" },
  });
  await prisma.staffUser.create({
    data: { merchantId: merchant.id, name: "Shaha Adam", email: "manager@thundi.mv", passwordHash, role: "MANAGER" },
  });

  // --- Membership tiers ---
  await prisma.membershipTier.create({
    data: { merchantId: merchant.id, name: "Bronze", minVisits: 0, perks: "Welcome bonus Boli on signup", sortOrder: 0, badgeColor: "#A16207" },
  });
  const silver = await prisma.membershipTier.create({
    data: { merchantId: merchant.id, name: "Silver", minVisits: 5, perks: "Birthday treat, priority seating", sortOrder: 1, badgeColor: "#64748B" },
  });
  await prisma.membershipTier.create({
    data: { merchantId: merchant.id, name: "Gold", minVisits: 15, perks: "Free dessert every visit, invite-only events", sortOrder: 2, badgeColor: "#CA8A04" },
  });

  // --- Rewards ---
  await prisma.reward.create({ data: { merchantId: merchant.id, name: "Free Coffee", description: "Any regular coffee, on us", boliCost: 50 } });
  await prisma.reward.create({ data: { merchantId: merchant.id, name: "20% Off Bill", description: "Applies to your full table bill", boliCost: 100 } });
  await prisma.reward.create({ data: { merchantId: merchant.id, name: "Free Dessert", description: "Chef's pick of the day", boliCost: 75 } });
  await prisma.reward.create({ data: { merchantId: merchant.id, name: "Thundi Beach Tee", description: "Limited edition beach-bar t-shirt", boliCost: 200, stock: 15 } });

  // --- Referral settings ---
  await prisma.referralSettings.create({
    data: { merchantId: merchant.id, referrerBonusBoli: 50, refereeBonusBoli: 25 },
  });

  // --- Guests ---
  const aishath = await signupGuest(merchant.id, "+9607700001", "Aishath Ali");
  await seedVisit(aishath.id, maleOutlet.id, maleOutlet.name, 10, daysAgo(20));
  await seedVisit(aishath.id, maleOutlet.id, maleOutlet.name, 10, daysAgo(12));
  await seedVisit(aishath.id, hulhumaleOutlet.id, hulhumaleOutlet.name, 10, daysAgo(5));
  await evaluateMembershipTierForGuest(prisma, aishath.id);

  // WELCOME campaign candidate — exactly one visit, nothing sent yet.
  const ibrahim = await signupGuest(merchant.id, "+9607700002", "Ibrahim Waheed");
  await seedVisit(ibrahim.id, maleOutlet.id, maleOutlet.name, 10, daysAgo(1));
  await evaluateMembershipTierForGuest(prisma, ibrahim.id);

  // BIRTHDAY campaign candidate — date of birth is today (year is arbitrary).
  const todayBirthday = new Date();
  todayBirthday.setFullYear(1995);
  const mariyam = await signupGuest(merchant.id, "+9607700003", "Mariyam Shifa", { dateOfBirth: todayBirthday });
  await seedVisit(mariyam.id, maleOutlet.id, maleOutlet.name, 10, daysAgo(25));
  await seedVisit(mariyam.id, maleOutlet.id, maleOutlet.name, 10, daysAgo(18));
  await seedVisit(mariyam.id, hulhumaleOutlet.id, hulhumaleOutlet.name, 10, daysAgo(10));
  await seedVisit(mariyam.id, maleOutlet.id, maleOutlet.name, 10, daysAgo(3));
  await evaluateMembershipTierForGuest(prisma, mariyam.id);

  // WIN_BACK campaign candidate — last visit well past the default 30-day window.
  const hassan = await signupGuest(merchant.id, "+9607700004", "Hassan Rasheed");
  await seedVisit(hassan.id, hulhumaleOutlet.id, hulhumaleOutlet.name, 10, daysAgo(60));
  await seedVisit(hassan.id, hulhumaleOutlet.id, hulhumaleOutlet.name, 10, daysAgo(45));
  await evaluateMembershipTierForGuest(prisma, hassan.id);

  // Silver-tier regular.
  const fathimath = await signupGuest(merchant.id, "+9607700005", "Fathimath Nazima");
  for (let i = 0; i < 8; i += 1) {
    await seedVisit(fathimath.id, maleOutlet.id, maleOutlet.name, 10, daysAgo(2 + i * 4));
  }
  await evaluateMembershipTierForGuest(prisma, fathimath.id);
  console.log(`Fathimath's tier after 8 visits should be Silver (minVisits=${silver.minVisits}).`);

  // Signed up, hasn't visited yet.
  await signupGuest(merchant.id, "+9607700006", "Ahmed Shiyam");

  // Referred by Aishath, already completed (first visit triggers completion).
  const aminath = await signupGuest(merchant.id, "+9607700007", "Aminath Waheeda");
  const aishathReferralCode = await prisma.referralCode.create({
    data: { guestId: aishath.id, merchantId: merchant.id, code: "BOLI-AISHA1" },
  });
  await prisma.referral.create({
    data: { referralCodeId: aishathReferralCode.id, referrerGuestId: aishath.id, refereeGuestId: aminath.id, status: "PENDING" },
  });
  await prisma.guest.update({ where: { id: aminath.id }, data: { referredByGuestId: aishath.id } });
  // Their first visit — completes the referral and pays out both sides, same as the real checkin flow.
  const aminathVisit = await seedVisit(aminath.id, maleOutlet.id, maleOutlet.name, 10, daysAgo(2));
  await evaluateMembershipTierForGuest(prisma, aminath.id);
  await prisma.referral.update({
    where: { refereeGuestId: aminath.id },
    data: { status: "COMPLETED", completedAt: aminathVisit.checkedInAt, referrerRewardBoli: 50, refereeRewardBoli: 25 },
  });
  await applyBoliTransaction(prisma, { guestId: aishath.id, type: "REFERRAL_BONUS", amount: 50, note: "Referral bonus — Aminath's first visit" });
  await applyBoliTransaction(prisma, { guestId: aminath.id, type: "REFERRAL_BONUS", amount: 25, note: "Referral bonus — welcome via Aishath's code" });

  // Regular with a review left.
  const moosa = await signupGuest(merchant.id, "+9607700008", "Moosa Fikry");
  const moosaVisit = await seedVisit(moosa.id, hulhumaleOutlet.id, hulhumaleOutlet.name, 10, daysAgo(4));
  for (let i = 0; i < 5; i += 1) {
    await seedVisit(moosa.id, hulhumaleOutlet.id, hulhumaleOutlet.name, 10, daysAgo(9 + i * 6));
  }
  await evaluateMembershipTierForGuest(prisma, moosa.id);
  await prisma.review.create({
    data: {
      guestId: moosa.id,
      outletId: hulhumaleOutlet.id,
      visitId: moosaVisit.id,
      rating: 5,
      comment: "Best short eats in Hulhumalé, staff remembered my order!",
    },
  });

  // --- Campaigns ---
  await prisma.campaign.create({
    data: {
      merchantId: merchant.id,
      name: "Welcome new guests",
      triggerType: "WELCOME",
      status: "ACTIVE",
      channel: "WHATSAPP",
      messageTemplate: "Hi {{guestName}}! Thanks for your first visit to Thundi Café — you've already earned Boli. See you again soon!",
      triggerConfig: "{}",
    },
  });
  await prisma.campaign.create({
    data: {
      merchantId: merchant.id,
      name: "Birthday treat",
      triggerType: "BIRTHDAY",
      status: "ACTIVE",
      channel: "WHATSAPP",
      messageTemplate: "Happy birthday {{guestName}}! Enjoy a free dessert on us this month — just show this message.",
      triggerConfig: "{}",
    },
  });
  await prisma.campaign.create({
    data: {
      merchantId: merchant.id,
      name: "We miss you",
      triggerType: "WIN_BACK",
      status: "ACTIVE",
      channel: "WHATSAPP",
      messageTemplate: "Hi {{guestName}}, it's been a while! Come back for a coffee — your Boli are waiting.",
      triggerConfig: JSON.stringify({ daysSinceLastVisit: 30 }),
    },
  });

  // --- Platform admin (admin-portal) ---
  await prisma.platformAdmin.create({
    data: { name: "Boli Platform Admin", email: "admin@boli.mv", passwordHash },
  });

  // --- Summary output ---
  const scanUrlMale = buildScanUrl(maleOutlet.id, maleOutlet.qrCodeToken);
  const scanUrlHulhumale = buildScanUrl(hulhumaleOutlet.id, hulhumaleOutlet.qrCodeToken);

  console.log("\nSeed complete.\n");
  console.log("Platform admin login (admin-portal):");
  console.log(`  admin@boli.mv / ${SEED_PASSWORD}`);
  console.log("\nMerchant staff login (merchant-dashboard):");
  console.log(`  Owner:   owner@thundi.mv / ${SEED_PASSWORD}`);
  console.log(`  Manager: manager@thundi.mv / ${SEED_PASSWORD}`);
  console.log("\nGuest app — scan URLs (open these in guest-app, or use them as the QR target):");
  console.log(`  Malé outlet:      ${scanUrlMale}`);
  console.log(`  Hulhumalé outlet: ${scanUrlHulhumale}`);
  console.log(`\nMerchant ID (for direct API testing): ${merchant.id}`);
  console.log("\nGuest phones you can log in as (OTP is auto-filled in development):");
  console.log("  +9607700001 Aishath Ali (referrer, Silver-ish history)");
  console.log("  +9607700002 Ibrahim Waheed (WELCOME campaign candidate)");
  console.log("  +9607700003 Mariyam Shifa (BIRTHDAY campaign candidate — dob is today)");
  console.log("  +9607700004 Hassan Rasheed (WIN_BACK campaign candidate)");
  console.log("  +9607700005 Fathimath Nazima (Silver tier)");
  console.log("  +9607700006 Ahmed Shiyam (signed up, never visited)");
  console.log("  +9607700007 Aminath Waheeda (referred by Aishath, referral completed)");
  console.log("  +9607700008 Moosa Fikry (left a review)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
