# All-in-One SaaS Platform

## Database Setup

This project uses **PostgreSQL** for both development and production. 
SQLite is NOT supported.

To set up your database:

1. Copy `.env.example` to `.env` and fill in your PostgreSQL `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   ```
2. Optional: use Docker for local PostgreSQL:
   ```bash
   docker run --name my-postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
   ```
3. Run Prisma commands to sync and generate the client:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

### Troubleshooting Prisma Generate
If `npx prisma generate` gets stuck or you see "module not found" errors:

1. **Kill hung processes:** `taskkill /F /IM node.exe /T` (Windows) or `pkill -f node` (Mac/Linux).
2. **Clean Environment:** Delete `node_modules` and `package-lock.json`.
3. **Reinstall:** Run `npm install`.
4. **Regenerate:** Run `npx prisma generate --force`.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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
