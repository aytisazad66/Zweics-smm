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

## Shopier API gerçek yanıt yapısı (loglardan doğrulandı)
```json
{
  "id": "450774817",
  "status": "unfulfilled",
  "paymentStatus": "paid",
  "dateCreated": "2026-06-14T05:03:49+0300",
  "totals": { "subtotal": "10.80", "shipping": "0.00", "total": "10.80" },
  "lineItems": [{ "productId": "48030326", "title": "Bakiye Yüklemesi..." }]
}
```
- Tutar: `o.totals.total` (NOT `o.totalPrice`, `o.amount`, `o.price`)
- Tarih: `o.dateCreated` (NOT `o.createdAt`, `o.created_at`)
- Ürün ID: `o.lineItems[0].productId` — **kesin eşleşme için kullan**
- GET /v1/products/{id} → **403 Forbidden** (erişim yok)
- GET /v1/orders?product_id={id} → product_id filtresini YOKSAYAR, tüm hesap siparişlerini döndürür

## CRITICAL SECURITY — Verification strategy
Güvenlik açığının kök nedeni: Shopier orders API product_id filtresini yok sayıyor → tüm hesap siparişleri dönüyor → eski paid siparişler false positive yaratıyordu.

**Mevcut güvenli yaklaşım (`shopierCheckPayment` fonksiyonu):**
1. Minimum 30 saniye bekleme (race condition önleme)
2. `GET /v1/orders?limit=50` ile tüm siparişleri al
3. Her sipariş için: `lineItems[0].productId === productId` AND `paymentStatus === 'paid'` AND `dateCreated >= payment.createdAt`
4. lineItems product ID eşleşmesi kesin — her ödeme benzersiz ürün yaratır
5. Webhook handler: SADECE `paymentStatus === 'paid'` kabul eder (status field değil)

**How to apply:** Amount/date filtresi yeterli DEĞİL — mutlaka lineItems.productId eşleşmesi kullan.

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
