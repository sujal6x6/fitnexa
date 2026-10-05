# FITNEXA — full-stack store on Cloudflare (Workers + D1)

Next.js 15 · TypeScript · Cloudflare Workers (OpenNext) · Cloudflare D1 (SQLite) · Razorpay · Cloudinary (optional images)

## What works
- Storefront: home, shop (search / category / sort / price), product pages (SEO + Product & Breadcrumb schema), cart, checkout, order confirmation, payment-failed, **My orders & details** (`/account`), order tracking, info pages, sitemap.xml, robots.txt
- **No customer accounts**: customers check out as guests. Their cart, saved details/address and list of their orders are kept in the browser's localStorage on their own device (clearable from `/account`). Orders can also be found on any device via Track order (order number + phone)
- Payments: server-side order creation, Razorpay Checkout, **server-side signature verification**, **webhook** (idempotent, amount-checked), stock decremented once per paid order, all in one D1 transaction
- Admin (`/admin`): separate login; dashboard; products (create/edit/delete, Cloudinary upload); orders (search, filter, status); **Settings** (brand & contact, SEO, homepage text, page/policy text, shipping, stock threshold, email, **Razorpay keys — encrypted, write-only, password-confirmed**)
- Security: PBKDF2 password hashing (admin), signed httpOnly admin cookie, middleware + per-route admin checks, zod validation, D1-backed rate limiting, prices always re-read from the database, secrets encrypted at rest

## Not built yet
Admin pages for categories, customers, coupons; wishlist, saved addresses, reviews, invoices, refunds via Razorpay API, pincode checker, order emails, page transitions/skeleton loaders. Policy pages are placeholders: add real text in Admin → Settings → Pages.

## Deploy (all free-plan services)
> Windows: use WSL (OpenNext for Cloudflare does not support native Windows).

1. `npm install`
2. `npx wrangler login`
3. `npx wrangler d1 create fitnexa` → copy the printed `database_id` into `wrangler.jsonc`. Also set `SITE_URL` there to your real address.
4. `npm run db:migrate:remote` then `npm run db:seed:remote`
5. Secrets: `npx wrangler secret put AUTH_SECRET` and `npx wrangler secret put SETTINGS_ENCRYPTION_KEY` (use long random strings: `openssl rand -base64 48`). Keep a safe copy of SETTINGS_ENCRYPTION_KEY — if it is lost, saved payment keys must be re-entered.
6. Create your admin login: `cp .dev.vars.example .dev.vars`, fill `ADMIN_EMAIL` / `ADMIN_PASSWORD` (10+ chars), run `npm run admin:sql`, then `npx wrangler d1 execute fitnexa --remote --file=admin.sql`, then delete `admin.sql` and remove the password from `.dev.vars`.
7. `npm run deploy`
8. Open `/admin/login` → Settings → Payments: paste your Razorpay **Test** keys, press **Test connection**, then place a test order. In Razorpay Dashboard add a webhook to `https://YOUR-DOMAIN/api/webhooks/razorpay` (events `payment.captured`, `order.paid`, `payment.failed`, `refund.processed`) and paste its secret in the same screen.

Instead of `npm run deploy` you can connect the Git repo in the Cloudflare dashboard (Workers Builds): build `npx opennextjs-cloudflare build`, deploy `npx wrangler deploy`.

## Run locally
`cp .dev.vars.example .dev.vars` (set `AUTH_SECRET`, `SETTINGS_ENCRYPTION_KEY`, admin vars) → `npm run db:migrate:local && npm run db:seed:local` → `npm run admin:sql && npx wrangler d1 execute fitnexa --local --file=admin.sql` → `npm run dev` (or `npm run preview` to run the real Workers build).
Session cookies are `Secure`; browsers accept them on `http://localhost`.

## Free-plan watch-outs
- **Admin login vs the 10 ms CPU limit.** Only the admin has a password now, so this affects one person logging in occasionally. Password hashing is CPU-heavy (~65 ms at the default 100,000 iterations on a normal computer) and the *Free* Workers plan allows ~10 ms, so the admin login may fail with error 1102. Fix, cheapest first: set `PBKDF2_ITERATIONS=10000` (`npx wrangler secret put PBKDF2_ITERATIONS`; weaker hash, still salted) **and** create the admin hash with the same value (`npm run admin:sql` reads it from `.dev.vars`); or use the $5/month Workers Paid plan. **Test the admin login right after your first deploy.**
- **Local-storage trade-offs.** If a customer clears their browser data or switches device, their saved details and order list are gone (Track order still works with the order number + phone). The cart is not shared across devices.
- Product/stock/settings data live in D1 (free tier is generous). D1 has point-in-time restore (“Time Travel”): check the current retention in Cloudflare’s docs.
- Before real orders: stock in the seed is a placeholder (10 each) — set real stock; set shipping charges in Settings → Shipping (default is free); products without photos are hidden until you activate them.
