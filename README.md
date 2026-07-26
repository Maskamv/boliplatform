# Boli Platform

The real product behind the [boli-website](../boli-website) marketing site: a guest-loyalty and
marketing platform for restaurants, cafés, guesthouses, and resorts in the Maldives. Guests earn
and redeem **Boli** — named after the cowrie shells once used as currency across the Maldives —
on every visit.

This is a local-first demo build: everything runs on your machine with no cloud accounts. WhatsApp
and SMS sends are mocked (logged to the console and recorded in a message log you can view in the
dashboard) rather than calling a real provider.

## What's here

- **`backend/`** — Node/Express/TypeScript API, Prisma + PostgreSQL.
- **`guest-app/`** — React/Vite app diners use to check in via QR (or the in-app camera scanner),
  track Boli, redeem rewards, edit their profile, and refer friends.
- **`merchant-dashboard/`** — React/Vite app restaurant staff use to manage guests, rewards,
  campaigns, and everything else for their own business.
- **`admin-portal/`** — React/Vite app for Boli's own platform operators: onboard new merchants,
  suspend/reactivate a business, and turn individual features on/off per merchant. Separate app,
  separate JWT secret/auth from staff and guests — a platform admin is never scoped to one
  merchant, unlike everyone else.
- **`packages/shared/`** — Shared TypeScript types/enums/constants used by all four.

## Quickstart

```bash
npm install
npm run prisma:migrate --workspace=backend   # creates dev.db and applies the schema
npm run prisma:seed --workspace=backend      # seeds a demo business, staff, guests, campaigns, platform admin
npm run dev                                  # starts backend (:4000), guest-app (:5173), merchant-dashboard (:5174), admin-portal (:5175)
```

The seed script prints everything you need to log in and try it out — staff credentials, guest
phone numbers, the platform admin login, and ready-to-use QR scan URLs — right after it runs.

Copy `backend/.env.example` to `backend/.env` first if you haven't (the migrate command needs
`DATABASE_URL` set).

## Trying it out

**As a guest**: open one of the printed scan URLs in `guest-app` (or scan the real QR code shown
in the merchant dashboard under an outlet's page with your phone). Log in with one of the seeded
phone numbers — the OTP is auto-filled in development, no real SMS involved.

**As staff**: open `merchant-dashboard` at `http://localhost:5174` and log in with the seeded
owner/manager credentials.

**As a platform admin**: open `admin-portal` at `http://localhost:5175` and log in with the seeded
`admin@boli.mv` credentials. From there you can add a new merchant (which also creates that
merchant's first owner login), suspend/reactivate any business, and toggle each of the 8 features
(Guest CRM, Boli Rewards, WhatsApp Marketing, Automated Campaigns, Smart QR Codes, Reviews,
Referrals, Memberships) on or off per merchant. Suspending or disabling a feature takes effect
immediately — even for staff/guests already logged in — since it's checked on every request, not
just at login.

**Automated campaigns**: the seed data includes guests specifically set up to be eligible for the
Welcome, Birthday, and Win-back campaigns. Go to Campaigns → "Run due campaigns now" in the
dashboard, then check Messages to see the mock sends (and your terminal running the backend for
the `[MOCK WHATSAPP]` log lines). In production this same logic would run on a schedule via
`npm run campaigns:run --workspace=backend` (see `backend/scripts/run-due-campaigns.ts`) — no code
changes needed, just point a real scheduler at it.

## Swapping in real providers

WhatsApp and SMS are behind small interfaces at `backend/src/providers/whatsapp/` and
`backend/src/providers/sms/`. Implement the interface with a real client (Meta Cloud API, Twilio,
etc.), point `WHATSAPP_PROVIDER` / `SMS_PROVIDER` at it in `backend/.env`, and nothing else in the
codebase needs to change.

## What's intentionally not built

- Billing/subscriptions (never requested; the marketing site has no pricing flow either).
- POS integrations (`Visit.source: POS_IMPORT` is reserved in the schema for later).
- File uploads (reward/tier images are plain URL strings).
- Real-time updates — the dashboard uses React Query refetching, not websockets.
- Multi-language / Dhivehi support — English only for now. Both frontends use `react-i18next`
  with a single `en` locale (`*/src/i18n/`), so adding a language back later just means adding a
  locale file and a switcher component; `packages/shared/src/enums.ts`'s `LANGUAGES` const is the
  single place that gates which language codes the API accepts.

See `backend/prisma/schema.prisma` for the full data model and each `backend/src/modules/*` folder
for the API surface per feature.
