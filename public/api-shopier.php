<?php
/**
 * Bor Media SMM Panel — Shopier Ödeme Entegrasyonu (cPanel/Shared Hosting)
 *
 * Endpoints:
 *   POST /api/shopier/create-product
 *   GET  /api/shopier/check-payment?ref=XXX
 *   POST /api/shopier/webhook
 *   GET  /api/shopier/admin-payments
 *   POST /api/shopier/register-webhook
 *
 * Bu dosya Replit/Vite versiyonuyla tam uyumludur.
 * Kritik düzeltmeler:
 *   - shopierCheckPayment: lineItems üzerinden KESIN productId eşleşmesi (product_id filtresi çalışmaz)
 *   - 30 saniye minimum bekleme süresi (race condition önleme)
 *   - paymentStatus SADECE 'paid'/'completed' kabul edilir
 *   - creditAmount / chargeAmount ayrımı doğru uygulanır
 *   - Mevcut ürün 2 saat içinde yeniden kullanılır (Shopier spam önleme)
 *   - writeUsers KV wrapper formatını korur
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

define('KV_DIR', __DIR__ . '/data');
define('SHOPIER_API', 'https://api.shopier.com/v1');

if (!is_dir(KV_DIR)) mkdir(KV_DIR, 0755, true);

// ── KV Yardımcılar ────────────────────────────────────────────────────────────

function kvRead(string $key): mixed {
    $file = KV_DIR . '/' . $key . '.json';
    if (!file_exists($file)) return null;
    $raw = file_get_contents($file);
    return $raw !== false ? json_decode($raw, true) : null;
}

function kvWrite(string $key, mixed $data): void {
    file_put_contents(
        KV_DIR . '/' . $key . '.json',
        json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        LOCK_EX
    );
}

// ── Shopier Config ────────────────────────────────────────────────────────────

/**
 * Hem düz format { "apiKey": "..." }
 * hem de KV wrapper formatını { "value": "{\"apiKey\":\"...\"}" } destekler.
 */
function shopierConfig(): ?array {
    $data = kvRead('smm_shopier_config');
    if (!$data) return null;
    if (isset($data['value']) && is_string($data['value'])) {
        $decoded = json_decode($data['value'], true);
        return is_array($decoded) ? $decoded : null;
    }
    return $data;
}

// ── Shopier HTTP ──────────────────────────────────────────────────────────────

function shopierRequest(string $method, string $endpoint, ?array $body = null): ?array {
    $cfg = shopierConfig();
    if (!$cfg || empty($cfg['apiKey'])) return null;

    $ch = curl_init(SHOPIER_API . $endpoint);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $cfg['apiKey'],
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }
    $resp = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if (!$resp) return null;
    $decoded = json_decode($resp, true);
    error_log("[Shopier] $method $endpoint → HTTP $httpCode | " . substr($resp, 0, 300));
    return $decoded;
}

// ── Kullanıcı Yardımcıları ────────────────────────────────────────────────────

function readUsers(): array {
    $data = kvRead('smm_users');
    if (!$data) return [];
    // Düz dizi
    if (array_key_exists(0, $data)) return $data;
    // KV wrapper: { "value": "[...]" }
    if (isset($data['value']) && is_string($data['value'])) {
        return json_decode($data['value'], true) ?? [];
    }
    return [];
}

/**
 * Dosya formatını bozmaması için mevcut wrapper'ı korur.
 */
function writeUsers(array $users): void {
    $file = KV_DIR . '/smm_users.json';
    $existing = file_exists($file) ? @json_decode(file_get_contents($file), true) : null;

    if (is_array($existing) && isset($existing['value']) && !array_key_exists(0, $existing)) {
        // KV wrapper formatı — koruyarak yaz
        $existing['value'] = json_encode($users, JSON_UNESCAPED_UNICODE);
        file_put_contents(
            $file,
            json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            LOCK_EX
        );
    } else {
        // Düz dizi formatı
        kvWrite('smm_users', $users);
    }
}

function creditUser(string $userId, float $amount): bool {
    $users = readUsers();
    foreach ($users as &$u) {
        if (($u['id'] ?? '') === $userId || ($u['email'] ?? '') === $userId) {
            $u['balance'] = round(($u['balance'] ?? 0) + $amount, 2);
            writeUsers($users);
            return true;
        }
    }
    error_log("[Shopier] creditUser: userId=$userId bulunamadı");
    return false;
}

// ── Ödeme Kayıtları ───────────────────────────────────────────────────────────

function readPayments(): array {
    return kvRead('smm_shopier_payments') ?? [];
}

function writePayments(array $payments): void {
    kvWrite('smm_shopier_payments', $payments);
}

function generateRef(): string {
    return 'SP' . round(microtime(true) * 1000) . strtoupper(substr(md5(uniqid('', true)), 0, 6));
}

// ── Güvenli Ödeme Doğrulama ───────────────────────────────────────────────────
/**
 * Vite implementasyonuyla (vite.config.ts shopierCheckPayment) tam uyumlu.
 *
 * Shopier'ın /orders?product_id=X endpoint'i product_id filtresini GÖRMEZDEN GELİR
 * ve tüm siparişleri döndürür. Bu yüzden:
 *  1. Minimum 30 saniye bekleme (henüz ödeme işleme alınmamış olabilir)
 *  2. Her sipariş için lineItems içinde productId KESIN eşleşmesi aranır
 *  3. paymentStatus SADECE 'paid' veya 'completed' kabul edilir
 *  4. Sipariş zamanı ödeme başlangıcından önce olamaz (5 sn tolerans)
 */
function shopierCheckPayment(string $productId, int $paymentCreatedAtMs): bool {
    $nowMs = (int)(microtime(true) * 1000);

    if ($nowMs < $paymentCreatedAtMs + 30000) {
        $elapsed = round(($nowMs - $paymentCreatedAtMs) / 1000);
        error_log("[Shopier][check] Henüz erken (elapsed={$elapsed}s), productId=$productId");
        return false;
    }

    $orders = shopierRequest('GET', '/orders?limit=50');
    if (!$orders) {
        error_log("[Shopier][check] orders API null döndürdü");
        return false;
    }

    $list = [];
    if (array_key_exists(0, $orders)) {
        $list = $orders;
    } else {
        $list = $orders['data'] ?? $orders['orders'] ?? [];
    }

    error_log("[Shopier][check] " . count($list) . " sipariş kontrol ediliyor, productId=$productId");

    foreach ($list as $o) {
        // Kesin eşleşme: lineItems içinde bizim productId var mı?
        $lineItems = $o['lineItems'] ?? $o['line_items'] ?? [];
        $hasProduct = false;
        foreach ($lineItems as $li) {
            $liProductId = (string)($li['productId'] ?? $li['product_id'] ?? '');
            if ($liProductId === (string)$productId) {
                $hasProduct = true;
                break;
            }
        }

        // SADECE paymentStatus === 'paid' veya 'completed' — status alanı KABUL EDİLMEZ
        $payStatus = $o['paymentStatus'] ?? '';
        $isPaid = ($payStatus === 'paid' || $payStatus === 'completed');

        // Sipariş zamanı kontrolü
        $orderTs  = $o['dateCreated'] ?? $o['createdAt'] ?? $o['created_at'] ?? null;
        $orderMs  = $orderTs ? (int)(strtotime($orderTs) * 1000) : 0;
        $timeOk   = ($orderMs === 0) || ($orderMs >= $paymentCreatedAtMs - 5000);

        error_log("[Shopier][check] order={$o['id']} hasProduct=" . ($hasProduct ? 'true' : 'false') .
            " isPaid=" . ($isPaid ? 'true' : 'false') .
            " timeOk=" . ($timeOk ? 'true' : 'false') .
            " paymentStatus=$payStatus date=$orderTs");

        if ($hasProduct && $isPaid && $timeOk) {
            error_log("[Shopier][check] ✅ EŞLEŞTİ — order {$o['id']} productId=$productId");
            return true;
        }
    }

    return false;
}

// ── Route Dispatch ────────────────────────────────────────────────────────────

$path = $_SERVER['PATH_INFO'] ?? parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('#^.*/api-shopier\.php#', '', $path);
$path = '/' . ltrim($path, '/');

// ── POST /create-product ──────────────────────────────────────────────────────
if ($path === '/create-product' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];

    // Frontend chargeAmount (komisyon dahil, Shopier'a ödenen) ve
    // creditAmount (bakiyeye eklenecek) gönderir.
    $creditAmount = floatval($body['creditAmount'] ?? $body['amount'] ?? 0);
    $chargeAmount = floatval($body['chargeAmount'] ?? $body['amount'] ?? $creditAmount);

    if ($creditAmount < 10 || $creditAmount > 5000) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'message' => 'Tutar 10 TL ile 5.000 TL arasında olmalıdır.']);
        exit;
    }
    if ($chargeAmount < $creditAmount || $chargeAmount > 6000) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'message' => 'Ödenecek tutar geçersiz.']);
        exit;
    }

    $cfg = shopierConfig();
    if (!$cfg || empty($cfg['enabled']) || empty($cfg['apiKey'])) {
        http_response_code(503);
        echo json_encode(['ok' => false, 'message' => 'Shopier entegrasyonu aktif değil.']);
        exit;
    }

    $userId   = (string)($body['userId']   ?? '');
    $userName = (string)($body['userName'] ?? '');

    // Aynı kullanıcı, aynı tutar, son 2 saat içinde bekleyen ürün varsa yeniden kullan
    $payments = readPayments();
    $twoHoursAgo = time() - 7200;
    foreach ($payments as $existingRef => $p) {
        $pCharge = floatval($p['chargeAmount'] ?? $p['amount'] ?? 0);
        if (
            ($p['status']   ?? '') === 'pending' &&
            ($p['userId']   ?? '') === $userId &&
            abs($pCharge - $chargeAmount) < 0.01 &&
            !empty($p['shopierProductUrl']) &&
            strtotime($p['createdAt'] ?? '1970-01-01') > $twoHoursAgo
        ) {
            error_log("[Shopier] Mevcut ürün yeniden kullanılıyor: {$p['shopierProductId']} | user=$userId ref=$existingRef");
            echo json_encode(['ok' => true, 'url' => $p['shopierProductUrl'], 'ref' => $existingRef]);
            exit;
        }
    }

    $imageUrl = $cfg['productImageUrl'] ?? 'https://cdn.pixabay.com/photo/2020/05/18/16/17/social-media-5187243_1280.png';
    $product  = shopierRequest('POST', '/products', [
        'title'         => 'Bakiye Yüklemesi - ' . number_format($creditAmount, 2, '.', '') . ' TL',
        'description'   => 'Bakiye (' . $userName . ')',
        'type'          => 'digital',
        'media'         => [['url' => $imageUrl, 'type' => 'image', 'placement' => 1]],
        'priceData'     => ['price' => $chargeAmount, 'currency' => 'TRY'],
        'shippingPayer' => 'sellerPays',
        'stockQuantity' => 1,
    ]);

    if (!$product || empty($product['id'])) {
        http_response_code(502);
        echo json_encode(['ok' => false, 'message' => 'Shopier ürün oluşturulamadı. Lütfen tekrar deneyin.']);
        exit;
    }

    $productId  = (string)$product['id'];
    // Farklı Shopier API yanıt formatlarını destekle
    $productUrl = $product['url']
        ?? $product['productUrl']
        ?? $product['link']
        ?? $product['checkoutUrl']
        ?? ('https://www.shopier.com/s/' . $productId);

    $ref = generateRef();
    $payments[$ref] = [
        'shopierProductId'  => $productId,
        'shopierProductUrl' => $productUrl,
        'userId'            => $userId,
        'userName'          => $userName,
        'amount'            => $creditAmount,
        'creditAmount'      => $creditAmount,
        'chargeAmount'      => $chargeAmount,
        'status'            => 'pending',
        'createdAt'         => date('c'),
        'processedAt'       => null,
    ];
    writePayments($payments);

    error_log("[Shopier] Yeni ürün oluşturuldu: $productId | user=$userId charge=₺$chargeAmount credit=₺$creditAmount ref=$ref");
    echo json_encode(['ok' => true, 'url' => $productUrl, 'ref' => $ref]);
    exit;
}

// ── GET /check-payment?ref=XXX ────────────────────────────────────────────────
if ($path === '/check-payment' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $ref = trim($_GET['ref'] ?? '');
    if (!$ref) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'message' => 'ref gerekli']);
        exit;
    }

    $payments = readPayments();
    if (!isset($payments[$ref])) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'status' => 'not_found', 'message' => 'Ödeme kaydı bulunamadı.']);
        exit;
    }

    $payment      = $payments[$ref];
    $creditAmount = floatval($payment['creditAmount'] ?? $payment['amount'] ?? 0);

    // Zaten işlendi mi? (webhook veya önceki polling)
    if (($payment['status'] ?? '') === 'completed') {
        echo json_encode(['ok' => true, 'status' => 'completed', 'amount' => $creditAmount]);
        exit;
    }

    // createdAt → millisaniye
    $createdAtMs = isset($payment['createdAt'])
        ? (int)(strtotime($payment['createdAt']) * 1000)
        : (int)(microtime(true) * 1000);

    $paid = shopierCheckPayment($payment['shopierProductId'], $createdAtMs);

    if ($paid) {
        $credited = creditUser($payment['userId'], $creditAmount);
        $payments[$ref]['status']      = 'completed';
        $payments[$ref]['processedAt'] = date('c');
        writePayments($payments);
        error_log("[Shopier] ✅ Ödeme onaylandı: ref=$ref ₺$creditAmount → {$payment['userId']}");
        echo json_encode(['ok' => true, 'status' => 'completed', 'amount' => $creditAmount]);
    } else {
        echo json_encode(['ok' => true, 'status' => 'pending', 'amount' => $creditAmount]);
    }
    exit;
}

// ── POST /webhook ─────────────────────────────────────────────────────────────
if ($path === '/webhook' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $payload = json_decode(file_get_contents('php://input'), true) ?? [];
    error_log('[Shopier Webhook] ' . substr(json_encode($payload, JSON_UNESCAPED_UNICODE), 0, 500));

    // Shopier order.created event: { event, data: { lineItems:[{productId}], paymentStatus } }
    $orderData = $payload['data'] ?? $payload;
    $lineItems = $orderData['lineItems'] ?? $orderData['line_items'] ?? [];
    $productId = '';

    if (!empty($lineItems)) {
        $productId = (string)($lineItems[0]['productId'] ?? $lineItems[0]['product_id'] ?? '');
    }
    if (!$productId) {
        $productId = (string)($payload['product_id'] ?? $payload['productId'] ?? $payload['item_id'] ?? '');
    }

    if ($productId) {
        $payments = readPayments();
        foreach ($payments as $ref => &$payment) {
            if (($payment['shopierProductId'] ?? '') === $productId && ($payment['status'] ?? '') === 'pending') {

                // GÜVENLİK: SADECE paymentStatus === 'paid' veya 'completed' kabul edilir.
                // order status ('fulfilled', 'unfulfilled' vb.) KABUL EDİLMEZ.
                // Shopier order.created eventi ödeme yapılmadan 'unfulfilled' status ile gelebilir.
                $paymentStatus = $orderData['paymentStatus'] ?? '';
                $webhookPaid   = ($paymentStatus === 'paid' || $paymentStatus === 'completed');

                if ($webhookPaid) {
                    $creditAmount = floatval($payment['creditAmount'] ?? $payment['amount'] ?? 0);
                    creditUser($payment['userId'], $creditAmount);
                    $payment['status']      = 'completed';
                    $payment['processedAt'] = date('c');
                    writePayments($payments);
                    error_log('[Shopier Webhook] ✅ ₺' . $creditAmount . ' → ' . $payment['userId'] . ' (ref=' . $ref . ')');
                } else {
                    error_log('[Shopier Webhook] ⚠️ paymentStatus onaylanmadı: ' . $paymentStatus . ' (ref=' . $ref . ')');
                }
                break;
            }
        }
    } else {
        error_log('[Shopier Webhook] ⚠️ productId bulunamadı: ' . json_encode($payload));
    }

    http_response_code(200);
    echo 'ok';
    exit;
}

// ── GET /admin-payments ───────────────────────────────────────────────────────
if ($path === '/admin-payments' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $payments = readPayments();
    $list = [];
    foreach ($payments as $ref => $p) {
        $chargeAmt = floatval($p['chargeAmount'] ?? $p['amount'] ?? 0);
        $creditAmt = floatval($p['creditAmount'] ?? $p['amount'] ?? 0);
        $list[] = [
            'ref'          => $ref,
            'userId'       => $p['userId']    ?? '',
            'userName'     => $p['userName']  ?? '',
            'chargeAmount' => $chargeAmt,
            'creditAmount' => $creditAmt,
            'shopierFee'   => round($chargeAmt - $creditAmt, 2),
            'status'       => $p['status']      ?? 'pending',
            'createdAt'    => $p['createdAt']   ?? '',
            'processedAt'  => $p['processedAt'] ?? null,
        ];
    }
    usort($list, function ($a, $b) {
        return strtotime((string)($b['createdAt'] ?? '')) - strtotime((string)($a['createdAt'] ?? ''));
    });
    echo json_encode(['ok' => true, 'payments' => $list]);
    exit;
}

// ── POST /register-webhook ────────────────────────────────────────────────────
if ($path === '/register-webhook' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body    = json_decode(file_get_contents('php://input'), true) ?? [];
    $baseUrl = rtrim($body['webhookBaseUrl'] ?? '', '/');

    if (!$baseUrl) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'message' => 'webhookBaseUrl gerekli.']);
        exit;
    }

    $cfg = shopierConfig();
    if (!$cfg || empty($cfg['apiKey'])) {
        http_response_code(503);
        echo json_encode(['ok' => false, 'message' => 'Shopier yapılandırılmamış.']);
        exit;
    }

    $webhookUrl = $baseUrl . '/api/shopier/webhook';
    $apiKey     = $cfg['apiKey'];

    // Mevcut webhook'ları listele ve sil
    $chList = curl_init(SHOPIER_API . '/webhooks');
    curl_setopt_array($chList, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $apiKey, 'Accept: application/json'],
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    $existing = json_decode(curl_exec($chList), true) ?? [];
    curl_close($chList);

    foreach ($existing as $wh) {
        if (!empty($wh['url']) && strpos($wh['url'], '/api/shopier/webhook') !== false) {
            $chDel = curl_init(SHOPIER_API . '/webhooks/' . $wh['id']);
            curl_setopt_array($chDel, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_CUSTOMREQUEST  => 'DELETE',
                CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $apiKey],
                CURLOPT_TIMEOUT        => 10,
                CURLOPT_SSL_VERIFYPEER => false,
            ]);
            curl_exec($chDel);
            curl_close($chDel);
        }
    }

    // Yeni webhook kaydet
    $chReg = curl_init(SHOPIER_API . '/webhooks');
    curl_setopt_array($chReg, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode(['url' => $webhookUrl, 'event' => 'order.created']),
        CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $apiKey, 'Content-Type: application/json', 'Accept: application/json'],
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    $regResp = json_decode(curl_exec($chReg), true) ?? [];
    $regCode = curl_getinfo($chReg, CURLINFO_HTTP_CODE);
    curl_close($chReg);

    if ($regCode >= 200 && $regCode < 300 && !empty($regResp['id'])) {
        echo json_encode(['ok' => true, 'webhookId' => $regResp['id'], 'webhookUrl' => $webhookUrl]);
    } else {
        http_response_code(502);
        echo json_encode(['ok' => false, 'message' => $regResp['message'] ?? 'Webhook kaydedilemedi.']);
    }
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found', 'path' => $path]);
