# Marutinandan — Cold Pressed Mustard Oil (Next.js)

A rebuilt, animated Next.js version of the Marutinandan site.

## Stack

- **Next.js 14** (App Router)
- **GSAP + ScrollTrigger** for scroll-linked animation
- **Lenis** for buttery smooth scrolling
- **Tailwind CSS** for styling

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Copy `.env.example` to `.env.local` and fill in values as needed:

```bash
cp .env.example .env.local
```

## What's included

### Animations
- **Preloader intro** — animated droplet + counter, curtain wipe reveal (runs once per session).
- **Smooth scroll** — Lenis wired into GSAP's ticker + ScrollTrigger, used site-wide.
- **Cursor-following effect** — custom ring + dot cursor on desktop, expands on hover over links/buttons; a separate cursor-following droplet parallaxes in the Hero.
- **Image reveal masks** — curtain-wipe reveal component (`components/RevealImage.jsx`) used in the Story sections.
- **Horizontal scroll gallery** — pinned, scroll-scrubbed product gallery on the homepage (`components/HorizontalGallery.jsx`).
- Staggered entrance animations on the hero, "Why Us" cards, and product grids.

### Multi-brand support
- Parent company: **Yugika Foods Private Limited** (see `/about`).
- Same products, two market labels, switchable from the navbar (persisted in `localStorage`):
  - **Marutinandan** — domestic (India) labelling
  - **Yugika** — export / international labelling (uses the real Yugika logo)
- `/about` also lists upcoming products (Yugika Gold Cold Pressed Peanut Oil, Cold Pressed Sesame Seed Oil — both "Coming Soon").
- Note: the brand switch is a client-side display toggle (name, logo, a few labels). Metadata/SEO tags stay on the primary "Marutinandan" identity — if the two brands ever need separate URLs/SEO, they should become genuinely separate builds or locales instead of one client toggle.

### Product catalog (from the Marutinandan Website Content Pack)
- 2 variants (Black / Yellow Mustard Oil) × 4 pack sizes (1L PET Bottle, 2L Can, 5L Can, 15L Tin) = 8 SKU pages.
- Each SKU page includes: features/health points, packaging + suitability, full product description, brand-aware SKU code, and the full 17-parameter lab spec table (moisture, rancidity, saponification, iodine, acid value, refractive index, peroxide value, HCN test, microbiology, etc.) with the FSSAI standard alongside each result.

- `/` — Home
- `/story` — Brand story
- `/products` — Full filterable product listing
- `/products/[slug]` — **Individual page per SKU** (6 SKUs: Black/Yellow × 500ml/1L/5L), each with its own metadata, canonical URL and `Product` JSON-LD schema
- `/lab-report` — Full lab report tables for both variants
- `/contact` — Order enquiry form
- `/admin` — Password-protected enquiry dashboard

### SEO + Analytics
- Per-page `metadata` (title templates, description, canonical URLs, Open Graph, Twitter cards).
- `Organization` and `Product` JSON-LD structured data.
- Auto-generated `sitemap.xml` (`app/sitemap.js`) that includes every product SKU page.
- Auto-generated `robots.txt` (`app/robots.js`) that disallows `/admin` and `/api`.
- Google Analytics 4 support via `NEXT_PUBLIC_GA_ID` (component no-ops if unset).

### Admin dashboard
- Simple password gate (`ADMIN_PASSWORD` env var, defaults to `marutinandan2026`) at `/admin`.
- Lists all enquiries submitted through the contact/product forms: name, phone, email, product, quantity, message, timestamp.
- Search + status filter (New / Contacted / Converted / Archived), status is editable inline.
- **Storage note:** enquiries are stored in `data-store/enquiries.json` via `lib/enquiries.js` so the demo works with zero setup. Serverless hosts (Vercel etc.) have a read-only filesystem in production — before deploying, swap the two functions in `lib/enquiries.js` for a real database (Postgres, Supabase, LibSQL/Turso, Airtable, etc.) while keeping the same function signatures, and nothing else in the app needs to change.

## Project structure

```
app/
  layout.jsx            Root layout: fonts, GA, preloader, smooth scroll, cursor
  page.jsx               Homepage
  story/page.jsx
  products/page.jsx
  products/[slug]/page.jsx
  lab-report/page.jsx
  contact/page.jsx
  admin/page.jsx
  api/enquiry/route.js    POST (submit) / GET (list, admin only) / PATCH (status)
  api/admin-login/route.js
  sitemap.js
  robots.js
components/               All UI + animation components
data/products.js          Product + variant data (edit here to add/change SKUs)
lib/enquiries.js          File-based enquiry storage (swap for real DB before prod)
```

## Adding a new SKU

Add an entry to the `products` array in `data/products.js` — its page, metadata, sitemap
entry, and product-grid card are generated automatically.
