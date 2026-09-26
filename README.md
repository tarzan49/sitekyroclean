# Kyro Clean Solutions

Website and quote quiz for Kyro Clean Solutions, an at-home upholstery cleaning
company in Portugal: https://cleansolutions.com.pt

The project started as a Lovable template; it is no longer edited or deployed
through Lovable.

## Before changing anything

The project rules and business facts live in [`CLAUDE.md`](./CLAUDE.md) (in
Portuguese). Read it first. Architecture notes are in
[`CONTEXT.md`](./CONTEXT.md). Prices, travel fees and review counts are read
from the code, never from a `.md` file.

## Stack

- Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui, React Router
- Supabase: CRM (Postgres) and Edge Functions (`supabase/functions/`)
- Resend for the lead notification email (Edge Function `send-lead-email`)
- Cloudflare Pages for hosting

## Local development

Requires Node.js and npm.

```sh
npm i
cp .env.example .env   # fill in the values; .env is per machine and never committed
npm run dev            # http://localhost:8080
```

Checks (all four are different; a green build does not type-check):

```sh
npm run typecheck   # tsc -b --noEmit. Do not use `npx tsc --noEmit`: it checks zero files
npm test
npm run lint
npm run build       # vite build + sitemaps + llms.txt + prerender
```

## Email (Resend)

Quote requests go to two independent Supabase Edge Functions: `submit-lead`
(CRM) and `send-lead-email` (email through Resend, sender domain
`cleansolutions.com.pt`). The email function needs two secrets in the Supabase
dashboard (Project Settings → Edge Functions → Secrets): `RESEND_API_KEY` and
`LEAD_NOTIFICATION_EMAIL`. Edge Functions are deployed separately from the
site (`npx -y supabase@latest functions deploy <name>`).

Details: the Resend notes in `CLAUDE.md` (eighth trap) and
[`docs/lead-spam-protection.md`](./docs/lead-spam-protection.md) (reCAPTCHA
and rate limits). Database changes are pasted into the Supabase SQL Editor;
never run `supabase db push` on this project (see `CLAUDE.md`, seventh trap).

## Deployment

Pushing to `master` on GitHub triggers a Cloudflare Pages build
(`npm run build`, output `dist`). The Cloudflare project needs its own
`VITE_*` environment variables, because `.env` is not in the repository.
