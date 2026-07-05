# FuelOS

> Mobile-first protein recommendation and logging app (Next.js + Supabase)

Summary
- Onboard to set protein target
- Get meal recommendations that fill your remaining protein gap
- Log meals and track daily/weekly progress
- Supabase for auth and persistence

Quick start (local)

1. Install dependencies

```bash
npm install
```

2. Create `.env.local` in the project root and set these values (from your Supabase project):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Ensure your Supabase project's Authentication > Settings includes the redirect URL:

```
http://localhost:3000/auth/callback
```

4. Run dev server

```bash
npm run dev
# open http://localhost:3000
```

Why sign-in may fail
- Missing or incorrect `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
- Supabase Authentication redirect URL not configured to `http://localhost:3000/auth/callback`.
- Supabase email sending not configured (SMTP) so magic links are not delivered.
- The app previously expected an OAuth `code` on the server callback; email magic links return session tokens in the URL fragment. To fix this we added a client-side callback page that correctly parses the session from the URL.

What I changed to help
- Added `app/auth/callback/page.tsx` (client) to finish sign-in after following magic links.
- Updated README with setup and troubleshooting steps.

Next steps (suggested)
- Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel Secrets if you need server-side privileged actions.
- Configure SMTP in Supabase project settings to enable email delivery for magic links.
- Deploy to Vercel and add environment variables there.

License
- MITThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
