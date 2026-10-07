# batpod-shop

**Live shop:** https://batpodshop.vercel.app

The customer-facing storefront. Next.js App Router, server-rendered so Google indexes your product pages and link previews work when you drop a product URL in a video description.

## Running it locally

```bash
npm install
cp .env.example .env.local     # point NEXT_PUBLIC_API_URL at batpod-server
npm run dev                    # http://localhost:3000
```

Start `batpod-server` first, or every page will show "the shop is not reachable".

## Pages

```
/                 Home — hero, the three ranges, what's printing now
/c/[slug]         A range, with sorting
/p/[slug]         Product — buy box, volume breaks, related, cross-sell
/cart             Cart with live server pricing, and checkout details
```

## What makes someone stay

Four things, all driven by data rather than hard-coded:

**Related products** (`Goes with this`). The server scores every other product against the one being viewed: same category +3, each shared tag +2 (capped at three tags), price within 40% +1, featured +0.5, in stock +0.25. Tags do the heavy lifting here — tag your products honestly and the rail gets better on its own.

**Cross-sell** (`From the other ranges`). Deliberately pulls from the *other* two categories. Someone who came for a keychain discovers the desk pieces exist.

**Volume breaks on the product page.** The "buy more, pay less" panel asks the server to quote the same product at 3, 6 and 10, and shows whatever comes back. Change a discount schedule in the admin and this panel changes with it — no deploy. It turns a discount from a checkout surprise into a reason to add one more.

**Recently viewed.** Kept in the browser only, never sent anywhere. It is the rail people actually click, because it is made of things they already showed interest in.

## Pricing

The cart stores only slugs and quantities. Every price comes from `POST /api/quote`. There is one pricing implementation and it lives on the server, so the customer can never see a number the server disagrees with — and when you change a rule in the admin, the shop reflects it immediately.

The cart also shows the adjustment trail per line ("Launch offer −₹25", "Small Items Volume −₹299"), which is unusually transparent for a shop and is the kind of detail people screenshot.

## Deploying to Vercel

1. Push to GitHub.
2. Vercel → **Add New → Project** → import. Framework preset is detected as Next.js; leave the defaults.
3. Environment variable, Production and Preview:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-server.vercel.app` |

4. Deploy. Then go back to the **server** project and add this shop's URL to its `ALLOWED_ORIGINS`.

`NEXT_PUBLIC_` variables are compiled into the browser bundle, so never put a secret in one. This one is only a public URL.

## Adding product photos

Upload them anywhere that gives a public HTTPS URL — Cloudinary's free tier is the usual choice — and paste the URLs into the product's **Image URLs** field in the admin. The storefront uses a plain `<img>` rather than `next/image`, so any host works without allowlisting it first.

Shoot the bike pieces on the bike. The product photo is doing more selling than any copy on the page.

## Caching

Catalog pages revalidate every 60 seconds. Long enough that a burst of visitors from a video doesn't hammer the free Atlas tier, short enough that a stock change you make in the admin appears while you are still looking at the page. Prices are never cached.

## Custom print page

`/custom` lets someone bring their own model and get a price in a few seconds.

The file **never leaves their computer**. The browser reads its name, size and type and sends only that, which is enough to sanity-check the request and carries none of the storage, scanning and privacy obligations that accepting real uploads brings. They email the model once there is a firm price.

Three deliberate choices:

- **The price is a range, not a number.** A single figure implies a precision nobody has before slicing. The range and the "this is a ceiling" note set the expectation that it will be revised.
- **Every dropdown comes from the server.** `GET /api/custom/options` supplies the values, so the form can never offer something the estimator rejects.
- **There is a way out.** "Not what you were expecting?" opens their mail app with the whole specification already written into the body. A customer whose job does not fit the form is a customer worth talking to, not one to lose.
