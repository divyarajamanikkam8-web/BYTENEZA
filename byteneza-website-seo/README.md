# BYTENEZA — Static Site (SEO / Performance / Accessibility build)

This is a real, multi-page static site (20 HTML pages + shared CSS/JS), built this
way on purpose: proper per-page SEO — unique `<title>`, meta description, canonical
URL, Open Graph and Twitter tags, and JSON-LD — needs actual server-delivered HTML
per URL. A single-page hash-routed app (like the first chat preview) cannot supply
that, because crawlers and link-preview bots (Facebook, X, WhatsApp, LinkedIn) read
the static HTML `<head>` and generally do not execute JavaScript to discover it.

## 1. Before you deploy

- **Domain placeholder**: every canonical/OG URL uses `https://www.byteneza.com`.
  Before going live, find-and-replace this with your real domain across all files
  (a `grep -rl byteneza.com .` gives you the file list).
- **Contact email**: `bytenezateam@gmail.com` is the public contact address.

## 2. Deploy (any static host works: Vercel, Netlify, Cloudflare Pages, GitHub Pages)

Upload this folder as-is. It already uses clean, extension-less URLs
(`/services/web-development/`) via one `index.html` per folder.

### Redirects to avoid duplicate-content URLs (configure at the host)
Static HTML can declare a canonical tag (already done, on every page) but it
can't *redirect* traffic — that's server/CDN config. Add these at your host:
- `http://` → `https://` (forced HTTPS)
- `byteneza.com` → `www.byteneza.com` (or the reverse — pick one and stick to it)
- `/page` → `/page/` (trailing slash, to match the URLs used throughout this site)
- Strip tracking query parameters before caching (`?utm_*`, `?fbclid`, etc.) — the
  canonical tag already tells search engines to ignore parameterized duplicates,
  but stripping at the edge keeps your cache and analytics cleaner too.

Netlify: use a `netlify.toml` or `_redirects` file. Vercel: use `vercel.json`
`redirects`. Both are one-time config, not something this static output needs to
contain.

## 3. Contact details

The `/contact/` page links to `bytenezateam@gmail.com` using the visitors email application. There is no form submission or third-party email integration.

## 4. Analytics

`assets/js/analytics.js` defines `window.BZ_CONFIG` (empty by default) and a single
`bzTrack(eventName, params)` function already wired to: email link click, every
"Get a Quote" button, every "Start Your Project" / "Discuss Your Idea" CTA, service
card clicks, project card clicks, and the email link. Nothing fires anywhere until
you set a real `gaMeasurementId` (GA4) or `metaPixelId` from an environment
variable — no IDs are hardcoded, and none are fabricated here.

A WhatsApp click event name (`whatsapp_click`) is defined and ready, but no
WhatsApp button exists yet since no real business number was provided — add the
button with your number and call `bzTrack('whatsapp_click')` on click when ready.

## 5. Images

No photography exists yet, so nothing here fabricates stock images — hero and
project visuals are inline CSS/SVG (zero extra image requests, which also helps
Core Web Vitals). When you add real photos or screenshots, follow this convention:
- Serve `.webp` (with an `.avif` variant if your host supports content negotiation)
- Descriptive filenames, e.g. `portfolio-website-frontend-developer-case-study.webp`,
  not `img1.webp`
- Always set `width` and `height` attributes (prevents layout shift / CLS)
- Add `loading="lazy"` on every image below the fold; leave above-the-fold hero
  images eager
- Write alt text that describes what's *in* the image, not keywords, e.g.
  `alt="Dashboard screen from the client admin panel showing the projects list"`

## 6. Core Web Vitals notes already built in
- One shared `style.css` and two small `defer`-loaded JS files — no framework, no
  render-blocking third-party scripts
- Google Fonts loaded with `preconnect` + `display=swap`
- Scroll-reveal is progressive enhancement only: content is visible by default
  (`.reveal{opacity:1}`) and only animates if JS runs *and* the visitor hasn't set
  `prefers-reduced-motion: reduce`
- No layout-shifting web fonts fallback issues: system font stack is the fallback

## 7. Accessibility already built in
- Skip-to-content link, semantic `<header>/<nav>/<main>/<footer>/<section>`,
  single `<h1>` per page with a logical heading order after it
- All form inputs have associated `<label for>`; every required field is marked
- Visible focus states (`:focus-visible`) throughout, not just default browser ones
- Icons are inline SVG marked `aria-hidden="true"` (decorative); interactive
  controls carry real text or `aria-label`

## 8. Local SEO
No address, phone number or Google Business info is included anywhere, since none
was provided — inventing one would misrepresent the business. The URL structure
(`/services/[slug]/`) and the Organization/Service JSON-LD are ready to extend with
location pages later (e.g. `/locations/[city]/`) once there's genuinely unique,
useful content for a specific location — not before.

## 9. What's deliberately not built as separate URLs yet
Each service page (e.g. `/services/web-development/`) covers its four listed
subtopics (Business Websites, Landing Pages, E-commerce, etc.) as on-page `<h2>`
sections rather than four more standalone URLs — a normal way to start a topic
cluster. If any subtopic earns enough unique content to justify its own page later,
promote it to `/services/web-development/e-commerce/` and link it from the pillar
page's existing section.

## 10. Design system and shared components

`assets/css/style.css` is the shared design system. Use the `--color-*` tokens
for the brand palette and the shared component classes (`.button`, `.component-card`,
`.service-card`, `.package-card`, `.project-card`, `.section-heading`, `.navbar`,
`.site-footer`, `.form-field`, `.cta-section`, and `.faq-item`) when extending
pages. The older class names remain as compatibility hooks for the existing pages.

## 12. Extending the site

Keep each public route as its own HTML document so its title, canonical URL,
structured data and social metadata stay available to crawlers without JavaScript.
Use the existing `/services/[slug]/` and `/projects/[slug]/`
patterns for new pages. Add new routes to `sitemap.xml` and connect them from the
relevant index and related-content links. The architecture leaves room for future
product routes such as `/products/`, `/platform/` or `/apps/`; these can point to
independent applications and APIs without changing the current marketing pages.
