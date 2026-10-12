# CLAUDE.md — batpod-shop

For AI assistants working in this repo. README says what it is; this says how to change it safely.

## Picture

Next.js 15.1 App Router, React 19, plain CSS, no libraries. Talks only to `batpod-server` at `NEXT_PUBLIC_API_URL`. Prices always come from the server (`/api/quote`); the client never computes money. Accounts are JWT-in-localStorage. No cookies, no analytics.

## Commands

```bash
npm install
npm run dev        # :3000, needs the server on :4000
npm run build      # prerenders ranges + products; must pass before committing UI work
npm run start      # serve the build
```

Owner's terminals: 1 server, 2 shop, 3 admin, 4 other. Say which. **No `# comments` on command lines** (zsh passes `#` through; npm errors with `EINVALIDTAGNAME`).

## Rules of the house

- **Keep `/c/[slug]` and `/p/[slug]` static.** No `searchParams`, `cookies()`, `headers()` or `fetch(…, {cache:'no-store'})` in those server components — any of them flips the page to per-request rendering and brings back the 1.5 s range switch. Sort/filter in the browser (`CategoryGrid`). Verify with `npm run build`: those routes must show `●` (SSG), not `ƒ`.
- **Client state lives in `lib/`** (`cart`, `auth`, `consent`, `theme`, `transitions`) as providers mounted in `app/layout.jsx`. Pages are thin.
- **Don't import a `'use client'` module's non-component exports into a server component.** The export becomes a client reference, not the value. Constants shared both ways live in plain modules (`lib/site.js`, `lib/profile.js`).
- **Ranges come from the database.** `app/layout.jsx` fetches categories (cached 60 s) into `CategoriesProvider`; `useCategories()` feeds the header tabs, drawer, footer and signup tiles. `lib/profile.js` RANGES is only the fallback. Never hard-code a range list in a component again.
- **Confirmations are toasts** (`components/Toast.jsx`, `useToast().show({ text, action })`), the way Next.js Commerce and Hydrogen storefronts do it.
- **Client pages get their metadata from a sibling `layout.jsx`** (`app/cart/layout.jsx` etc.). A `'use client'` page cannot export `metadata`; without the layout the page falls back to the site title.
- **Primary buttons are `Pressable` (button), `PressableLink` (next/link) or `PressableA` (plain anchor)** from `components/Motion.jsx`. Plain `<button className="btn">` is fine for secondary actions.
- **Images from the API are paths** (`/api/images/<id>`); render through `imageSrc()` from `lib/api.js`.
- **`useSearchParams` needs a Suspense boundary at build time.** Read `window.location.search` in a `useEffect` instead (see `app/account/page.jsx`, `app/track/page.jsx`).
- **Hydration:** anything read from `localStorage` goes into state in a `useEffect`, never in a `useState` initialiser (server renders the default; client must match on first paint).
- **CSS:** one file, `app/globals.css`, sections headed with `/* ---------- name ---------- */`. Custom properties on `:root`; dark overrides under both the media query and `[data-theme='dark']`. Watch specificity — a past bug: `.range-chip span` beat `.range-chip-art` and overlapped text.
- **Links that should cross-fade use `TransitionLink`**; the header and range tabs have `view-transition-name`s so they stay put.
- **Prices render through `rupees()`** from `lib/api.js`: `₹1,499` with Indian grouping.
- Copy is Indian English, plain, no exclamation marks, no emojis. Error text tells the person what to do next.

## Mirrors to keep in step with the server

| Here | There |
|---|---|
| `lib/profile.js` RANGES / RIDES / USE_FOR / CONTACT, `passwordProblem` | `batpod-server/src/models/User.js`, `routes/auth.js` |
| `components/OrderTimeline.jsx` STEPS | `batpod-server/src/models/Order.js` statuses |
| `app/c/[slug]/page.jsx` KNOWN | seeded category slugs |
| `lib/auth.js` VALID_CHANNELS | `batpod-server/src/models/Order.js` channel enum |
| `lib/site.js` CONSENT_VERSION | `routes/auth.js` consent version (`'2026-10'`) |

## Verifying UI changes without his Mac

The owner's Linux bridge VM cannot run macOS-built binaries, so builds happen in a scratch copy with a mock API (`mockapi/server.cjs` on :4100 serving the seed catalog, auth, orders and tracking) and `next start -p 3100`; screenshots via Playwright (`twin/shopshot.mjs`, `twin/flow.mjs`). When you change the API contract, extend the mock so the flow can be screenshotted. Kill ports with `fuser -k 3100/tcp`, not `pkill` (which has killed the shell before).

## Where to add things

| Want to… | Touch |
|---|---|
| A new page | `app/<route>/page.jsx`; add to `Header` or `SiteFooter`; client component only if it needs state |
| A new range | server seed → `KNOWN`, `RANGES`, a scene in `components/scenes/Scenes.jsx` + `SCENES` map, footer link |
| Change what signup asks | `lib/profile.js` + `components/ProfileQuestions.jsx`; server `cleanProfile` must accept the keys |
| Change checkout | `app/cart/page.jsx` (form + `placeOrder`), `ConfirmAndPay` for what happens after |
| Add a payment gateway | Replace/extend `ConfirmAndPay` in `components/OrderTimeline.jsx`; keep the WhatsApp fallback |
| Contact details, WhatsApp number, UPI ID, social links | `lib/site.js` only |
| Change the shop-closed screens | `components/ShopGate.jsx` |
| Dimension reference objects | `REFS` in `components/Dimensions.jsx` |
| Delivery estimate wording / state list | `components/AddressFields.jsx`, `lib/india.js`; zones live on the server in `src/pincode.js` |
| Header links, status pill text, drawer | `components/Header.jsx` (`RANGE_LINKS`, `OTHER_LINKS`, `MORE_LINKS`) |

## Deployment facts

Vercel, `NEXT_PUBLIC_API_URL` set at build time (it is inlined — change it, redeploy). GitHub Pages cannot host this app as is (ISR + dynamic routes need a server). The static alternative (`output: 'export'`) would bake the catalog at build time and lose `/account/orders/[ref]` unless rewritten as a query-string page — possible, not done.

## Git

Author `Prateek Patel <prateek.patel@bluvium.com>`. Assistants commit, owner pushes. Run `npm run build` first.
