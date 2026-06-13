---
name: Shopier integration
description: Shopier REST API payment integration — product creation, payment verification, and localStorage ref flow
---

## API
- Endpoint: `POST https://api.shopier.com/v1/products`
- Auth: Bearer JWT token (stored in `data/smm_shopier_config.json` → field `apiKey`)
- Required fields: `title`, `type:"digital"`, `media:[{url,type:"image",placement:1}]`, `priceData:{price,currency:"TRY"}`, `shippingPayer:"sellerPays"`, `stockQuantity:1`
- Response: `{id, url:"https://www.shopier.com/{id}"}` — `url` is the direct payment page

## Key design decision: localStorage ref
Shopier redirect URL is a static global setting in their dashboard (cannot be per-payment dynamic).
To track which payment to process on return, we store `shopier_pending_ref` in localStorage before redirecting the user. The ShopierSuccess page reads it back.

**Why:** Shopier's new REST API doesn't support per-product `successUrl`/`failUrl` fields. The account-level redirect URL is fixed.

## Verification strategy (check-payment endpoint)
1. Try `GET /v1/orders?product_id={id}` — look for status "paid" or "completed"
2. Fallback: check `GET /v1/products/{id}` — if `stockQuantity === 0`, it was purchased (created with 1)

## Files
- `vite.config.ts` — `shopierPlugin()` with 3 middleware routes
- `src/pages/ShopierSuccess.tsx` — polls check-payment, clears localStorage on success
- `src/pages/ShopierFail.tsx` — error page with retry/back buttons
- `src/App.tsx` — detects `/odeme-basarili` and `/odeme-basarisiz` paths before SPA render
- `src/pages/ClientDashboard.tsx` — `handleShopierPay()` + Shopier orange button in add-funds tab
- `public/api-shopier.php` — PHP production handler (cPanel)
- `data/smm_shopier_config.json` — `{apiKey, enabled, productImageUrl}`
- `data/smm_shopier_payments.json` — pending/completed payment records by ref

## Payment record structure
```json
{ "SP{timestamp}{random}": { "shopierProductId", "userId", "amount", "status":"pending|completed", "createdAt", "processedAt" } }
```

## Shopier account setup required
User must configure in Shopier dashboard:
- After payment success redirect URL: `https://their-domain.com/odeme-basarili`
- After payment fail redirect URL: `https://their-domain.com/odeme-basarisiz`
- Webhook URL (optional): `https://their-domain.com/api/shopier/webhook`
