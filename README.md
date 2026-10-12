# batpod-shop

**Live:** https://batpodshop.vercel.app
**Repo:** https://github.com/PrateekEditor/Batpod-shop
**API it talks to:** https://batpod-sever.vercel.app ([batpod-server](https://github.com/PrateekEditor/batpod-sever))

The customer-facing storefront for Batpod Labs — 3D-printed gear for riders, desks and daily life, designed and printed in Pune on a Bambu Lab A1 Combo. Four ranges: Bike & Rider, Tabletop, Daily Fixes, Minis.

If you are an AI assistant working in this repo, read `CLAUDE.md` first.

## Stack

| Piece | What | Why |
|---|---|---|
| [Next.js 15.1](https://nextjs.org/docs) App Router, React 19 | Framework | Static range and product pages served from the edge; server components for data, client components only where state lives |
| Plain CSS in `app/globals.css` with custom properties | Styling | One file, light/dark via `data-theme`, no build-time CSS tooling |
| Fonts from [Google Fonts](https://fonts.google.com/) (Archivo, Public Sans, JetBrains Mono) | Type | The one outside request a page makes |
| Hand-drawn isometric SVG (`components/scenes/`) | Range art | No image assets to host; each range has its own animated scene |
| [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) | Page changes | Cross-fade between pages, product card morphs into its gallery; falls back to a plain navigation where unsupported |
| `localStorage` | Cart, theme, session, consent | No cookies anywhere on the site |
| [Vercel](https://vercel.com/) | Hosting | ISR needs a server; Vercel's free Hobby tier does it with no setup |

No UI library, no CSS framework, no state library, no analytics.

## Running it locally

```bash
npm install
cp .env.example .env.local        # NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev                       # http://localhost:3000
```

The server must be running and seeded (`batpod-server`: `npm run seed`, `npm run dev`). From the workspace root: `npm run shop`.

`npm run build` prerenders every range and product; if the API is unreachable at build time the four known ranges are still emitted and products render on first request.

## Pages

| Route | Rendering | What |
|---|---|---|
| `/` | static | Hero with the printer scene, range cards, personalised rail, popular rail, recently viewed |
| `/c/[slug]` | SSG + ISR 60 s | A range: tabs, scene, product grid sorted in the browser |
| `/p/[slug]` | SSG + ISR 60 s | Product: gallery, dimensions to scale against a coin/card/phone/A4, volume breaks, related |
| `/cart` | client | Server-priced cart with the discount trail, checkout form, then WhatsApp + UPI confirmation |
| `/custom` | client | Custom print: options, instant estimate, request form |
| `/signup` | client | Three-step wizard — account, optional questions, welcome with the first-order code |
| `/login` | client | Sign in |
| `/account` | client | Tabs: Orders (each opens `/account/orders/[ref]`), Details, Preferences |
| `/account/orders/[ref]` | client | One order: progress timeline, courier reference, workshop note, confirm & pay |
| `/track` | client | Track without an account: reference + phone tail or email |
| `/contact` | static | Social links, hours, address |
| `/privacy` | static | Plain-English list of everything stored, with the personalisation switch |

Client pages carry their `<title>` and description through a sibling `layout.jsx` (a client component cannot export metadata). `app/icon.svg` is the favicon.

`loading.jsx` files under `/c` and `/p` give an instant skeleton while a not-yet-prerendered page renders.

## How the pieces fit

```
app/layout.jsx        ThemeProvider › TransitionProvider › AuthProvider › CartProvider
                      Header · ShopGate(children) · SiteFooter · CookieConsent
lib/api.js            API_URL, fetch helpers; catalog reads cached 60 s, prices never
lib/cart.js           Cart state (slug + quantity only), quote refresh, recently-viewed trail
lib/auth.js           Accounts: token in localStorage, signup/login/updateProfile/loadOrders/loadOrder
lib/consent.js        The personalisation yes/no, versioned; useConsent() hook
lib/profile.js        Optional-question choices, password rules, email typo suggestions
lib/site.js           Name, city, hours, social handles, WhatsApp number, UPI ID + link builders
lib/theme.js          data-theme on <html>, boot script runs before paint
lib/transitions.js    document.startViewTransition wrapper + TransitionLink
components/ShopGate   Polls /api/status every 60 s; paused / maintenance / unreachable screens
components/scenes     Isometric SVG scenes per range (Printer, Biker, Tabletop, Daily, Minis)
components/OrderTimeline  Progress line + ConfirmAndPay (WhatsApp + UPI buttons)
components/ProfileQuestions  The optional questions, shared by signup and account
```

## Accounts, orders and payment

Accounts are optional; guest checkout works. Signup asks for email and password, then offers optional questions (what they're into, whether they ride and on what, where prints end up, contact preference, offers opt-in) as tiles and chips that can be skipped in one click. Password problems and email typos (`gmial.com`) show while typing; a hidden `website` field catches bots.

An order's progress (`Received → Confirmed → Printing → Shipped → Delivered`) comes from the server's `statusHistory`. Signed-in customers see it under their account; anyone can use `/track` with the reference plus the phone tail or email that was on the order.

There is no payment gateway. After placing an order the customer gets two buttons built from `lib/site.js`:

- **Confirm on WhatsApp** — `https://wa.me/<whatsappNumber>?text=…` with the reference, lines and total already typed.
- **Pay by UPI** — `upi://pay?pa=<upiId>&pn=…&am=<total>&cu=INR&tn=Order <ref>` which any UPI app opens with the amount filled in. On desktop the UPI ID and reference are shown as text instead.

Both say "coming soon" until `whatsappNumber` and `upiId` are filled in. When a gateway is added (Razorpay), `ConfirmAndPay` in `components/OrderTimeline.jsx` is the one place to swap.

## Address and delivery window

`components/AddressFields.jsx` asks for the pincode first: six digits trigger `GET /api/pincode/:pin` on the server (India Post directory), fill city and state, and show a delivery window ("Thu 15 – Sat 17 Oct · 2–4 days by courier after dispatch"). State is a dropdown of the 36 states and UTs (`lib/india.js`), since couriers reject free-text spellings. Both stay editable. Used in the cart and the account's Details tab; orders store `customer.state`.

## Header, motion and layout

The header (`components/Header.jsx`) lists the ranges straight from the database — add a category in the admin and it appears in the tabs, the mobile drawer, the footer and the signup tiles on the next revalidate — as numbered mono labels with one indicator that slides between them, a live status pill polled from `/api/status` (green pulse when the A1 is online, amber paused, red offline), and at ≤900 px a hamburger that drops a drawer with the ranges, shop links and account. Primary buttons are `Pressable` / `PressableLink` / `PressableA` from `components/Motion.jsx`, built on [motion](https://motion.dev) (`motion/react`) with a spring lift on hover and press on tap; `MotionConfig reducedMotion="user"` turns it off for people who asked their OS for less movement. The page is 1440 px wide at most with a fluid gutter (`--max`, `--gutter` in `globals.css`).

## Consent and personalisation

The site sets no cookies. Essentials (cart, theme, sign-in, arrival channel) are kept without asking. The recently-viewed trail and the "picked for you" rail built from it are off until the visitor answers the one-question notice (`components/CookieConsent.jsx`); saying no also wipes the trail. The answer is versioned (`CONSENT_VERSION` in `lib/site.js`) — bump it when the notice changes and everyone is asked again. `/privacy` lists everything and has the switch.

## Performance

Range switching was measured at ~1.5 s when range pages were server-rendered per request (the page read `searchParams`, which [forces dynamic rendering](https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-rendering)). Now: `generateStaticParams` + `revalidate = 60`, sorting moved to the browser, `loading.jsx` skeletons, and a 160 ms cross-fade. A warm range switch makes zero network requests and takes about 70 ms. Keep `searchParams`, `cookies()` and `headers()` out of `app/c` and `app/p`.

## Theme

`lib/theme.js` stores `light`/`dark`/system in `localStorage` and sets `data-theme` on `<html>`; `THEME_BOOT_SCRIPT` runs in `<head>` before paint so dark mode never flashes white. Colours are custom properties at the top of `globals.css`; dark values are repeated under both `@media (prefers-color-scheme: dark)` and `[data-theme='dark']`.

## Deploying to Vercel

1. Import the repo; framework preset Next.js is detected.
2. Environment variable `NEXT_PUBLIC_API_URL=https://batpod-sever.vercel.app` (and `NEXT_PUBLIC_CONTACT_EMAIL`).
3. Add the shop's origin to `ALLOWED_ORIGINS` on the server.

**Other hosts:** the shop needs a server for ISR and the dynamic order route, so it cannot live on GitHub Pages as is. Free alternatives that run Next.js: Cloudflare Pages (via OpenNext), Netlify, Render (spins down when idle). The admin and the print calculator are static and *can* go on GitHub Pages — see their READMEs. For customers, a custom domain in front of whichever host (`.in` domains are a few hundred rupees a year) matters more than the host.

## Customising

- **Identity, contact, payment:** everything is in `lib/site.js` — name, city, hours, social handles and links, `whatsappNumber` (digits with country code), `upiId`, `upiName`.
- **A new range:** seed it on the server, then add the slug to `KNOWN` in `app/c/[slug]/page.jsx`, `RANGES` in `lib/profile.js`, a scene in `components/scenes/Scenes.jsx` (and the `SCENES` map), and a footer link.
- **Product photos:** upload them in the admin's product editor (resized and compressed in the browser, stored in the database, served from `/api/images/:id`); the first is the card photo. The gallery falls back to the drawn views (`ProductViews.jsx`) when there are none.
- **Dimension references** (coin, card, phone, A4): `REFS` in `components/Dimensions.jsx`.
- **Optional profile questions:** `lib/profile.js` for the choices, `components/ProfileQuestions.jsx` for the layout; keep the keys in step with the server's `models/User.js`.
- **Order steps and wording:** `STEPS` in `components/OrderTimeline.jsx`.
- **Colours, type, spacing:** the custom properties at the top of `app/globals.css`.
- **Copy:** it is all in the page files; there is no CMS.

## References used while building this

- Next.js App Router: rendering modes, `generateStaticParams`, `revalidate`, `loading.js` — https://nextjs.org/docs/app
- View Transitions API — https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
- React 19 — https://react.dev/
- motion (animation) — https://motion.dev/docs/react
- India Post pincode API — https://api.postalpincode.in/
- WhatsApp click-to-chat links — https://faq.whatsapp.com/5913398998672934
- NPCI UPI deep linking (`upi://pay` parameters) — https://www.npci.org.in/what-we-do/upi/product-overview
- Razorpay checkout (for later) — https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
- India's Digital Personal Data Protection Act, 2023 (consent framing) — https://www.meity.gov.in/data-protection-framework
- OWASP authentication cheat sheet (password rules, honeypots, same-message login) — https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- Bambu Lab A1 — https://bambulab.com/en/a1
- Design sources for the ranges: MakerWorld https://makerworld.com, Printables https://www.printables.com, Thingiverse https://www.thingiverse.com, Cults3D https://cults3d.com (check the licence — most are non-commercial)
- Reference for the admin's live-workshop idea: Dilum Sanjaya's office-floor visualisation; the LogiFlow-style animated dashboard mock
