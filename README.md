# Sago

The Sago Gold Reserve Whisky website, built with Next.js App Router. The promotional game uses server-side campaign configuration and is prepared for Supabase deployment.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to view the site.

## Verification

Run the same checks used before deployment:

```bash
npm run lint
npm run typecheck
npm run build
```

## Vercel deployment

Import this repository into Vercel with the default Next.js settings:

- Framework preset: `Next.js`
- Build command: `npm run build`
- Install command: `npm install`
- Output directory: leave blank

Copy `.env.example` to `.env.local` and provide the Supabase and campaign configuration before enabling the promotional APIs. Images and the logo are served from `public/assets`.

## Big 5 backend setup

1. Create a Supabase project.
2. Apply `supabase/migrations/20261003000000_big5_core.sql`.
3. Set the variables in `.env.example`.
4. Create an active campaign, participating venues, Big 5 symbols, and approved rewards in Supabase. Reward `probability_config.weight` values and commercial rules are intentionally not seeded because they require business approval.

The game APIs fail closed until those values exist. The service-role key is server-only and must never use a `NEXT_PUBLIC_` prefix.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
