# AERRA AXIS site

Static homepage (`index.html`) + Contact Us page (`contact.html`) with a
Vercel serverless function (`api/contact.js`) that emails form submissions
via Resend.

## Local files
- `index.html` — homepage
- `contact.html` — new Contact Us page
- `api/contact.js` — serverless function, receives the form POST and sends email
- `package.json` — declares the `resend` dependency the function needs
- `.env.example` — copy to `.env.local` for local testing, never commit real keys

## For anyone Deploying (GitHub + Vercel, free)
1. Please download/Push this folder to a your GitHub repo (add your image assets — `logo-dark.webp`,
   `logo-light.webp`, `hero-motif.webp`, etc. — alongside `index.html` if not already there).
2. On vercel.com, "Add New Project" → import that repo. Framework preset: **Other**
   (no build step needed — Vercel serves the HTML as static and `api/contact.js`
   as a serverless function automatically).
3. In Project → Settings → Environment Variables, add:
   - `RESEND_API_KEY`
   - `CONTACT_TO_EMAIL`
   - `CONTACT_FROM_EMAIL`
4. Deploy. Your form now posts to `https://<your-project>.vercel.app/api/contact`.

## Resend Config:
1. Create a free Resend account and an API key (Settings → API Keys).
2. Add and verify your sending domain (Domains → Add Domain) by adding the
   DNS records Resend gives you at your domain registrar. Verification is
   required before you can send from `brief@yourdomain.com` — until then,
   Resend's shared test domain only delivers to your own account email.
3. Set `CONTACT_FROM_EMAIL` to an address on that verified domain, and
   `CONTACT_TO_EMAIL` to wherever you want briefs delivered (can be any inbox).

## Connect custom domain
Vercel → Project → Settings → Domains → add your domain, then point it at
Vercel following the DNS instructions shown (an A/ALIAS record for the root,
CNAME for `www`). HTTPS is issued automatically.

## Remember Free-tier limits:
- **Resend Free**: 3,000 emails/month, capped at 100/day, 1 verified domain.
  A campaign contact form will not come close to this normally.
- **Vercel Hobby (free)**: generous bandwidth/function limits, but its terms
  restrict Hobby to personal, non-commercial use — a client-facing consulting
  business technically falls under commercial use, so confirm current terms
  on vercel.com/pricing before launch; Pro is $20/month per seat if needed.
