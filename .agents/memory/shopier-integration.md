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

## CRITICAL SECURITY FIX — Verification strategy
**NEVER use `shopierCheckOrders` (Shopier orders API) for payment confirmation.**

Root cause of the security vulnerability:
- Shopier `GET /v1/orders?product_id=X` IGNORES the product_id filter — returns ALL orders for the account
- Old paid orders have `paymentStatus:'paid'` → every check returns `true` → balance added without payment
- `stockQuantity === 0` fallback was also false-positive prone for digital products

**Current safe approach:**
1. `check-payment` endpoint ONLY reads the local `payment.status` from `data/smm_shopier_payments.json`
2. `payment.status` is set to `'completed'` ONLY by the webhook handler
3. Webhook handler ONLY accepts `paymentStatus === 'paid'` (not `status` field checks)
4. `shopierCheckOrders` function always returns `false` (disabled)

**How to apply:** Any future work on Shopier payment verification must NOT call Shopier orders/products APIs for payment confirmation. Only trust the webhook.

## Files
- `vite.config.ts` — `shopierPlugin()` with 3 middleware routes
- `src/pages/ShopierSuccess.tsx` — polls check-payment, clears localStorage on success
- `src/pages/ShopierFail.tsx` — error page with retry/back buttons
- `src/App.tsx` — detects `/odeme-basarili` and `/odeme-basarisiz` paths before SPA render
- `src/pages/ClientDashboard.tsx` — `handleShopierPay()` + Shopier orange button in add-funds tab
- `data/smm_shopier_config.json` — `{apiKey, enabled, productImageUrl}`
- `data/smm_shopier_payments.json` — pending/completed payment records by ref

## Payment record structure
```json
{ "SP{timestamp}{random}": { "shopierProductId", "userId", "amount", "creditAmount", "status":"pending|completed", "createdAt", "processedAt" } }
```

## Shopier account setup required
User must configure in Shopier dashboard:
- After payment success redirect URL: `https://their-domain.com/odeme-basarili`
- After payment fail redirect URL: `https://their-domain.com/odeme-basarisiz`
- Webhook URL (ZORUNLU): `https://their-domain.com/api/shopier/webhook`
  - Webhook olmadan ödeme onaylanamaz — sadece admin manuel bakiye ekleyebilir
