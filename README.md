# Sago

The Sago Gold Reserve Whisky website, built with Next.js App Router and deployed as a static-friendly Vercel application.

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

The site does not require environment variables. Images and the logo are served from `public/assets`.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
