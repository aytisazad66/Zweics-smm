<?php
/**
 * Shopier payment integration for production (cPanel/shared hosting)
 * Handles: POST /api/shopier/create-product
 *          GET  /api/shopier/check-payment
 *          POST /api/shopier/webhook
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

define('KV_DIR', __DIR__ . '/kv_data');
define('SHOPIER_API', 'https://api.shopier.com/v1');

if (!is_dir(KV_DIR)) mkdir(KV_DIR, 0755, true);

function kvRead(string $key): mixed {
    $file = KV_DIR . '/' . $key . '.json';
    if (!file_exists($file)) return null;
    return json_decode(file_get_contents($file), true);
}

function kvWrite(string $key, mixed $data): void {
    file_put_contents(KV_DIR . '/' . $key . '.json', json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

function shopierConfig(): ?array {
    return kvRead('smm_shopier_config');
}

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
        CURLOPT_TIMEOUT => 15,
    ]);
    if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    $resp = curl_exec($ch);
    curl_close($ch);
    return $resp ? json_decode($resp, true) : null;
}

function generateRef(): string {
    return 'SP' . round(microtime(true) * 1000) . strtoupper(substr(md5(uniqid()), 0, 6));
}

function readUsers(): array {
    $data = kvRead('smm_users');
    if (!$data) return [];
    if (isset($data[0])) return $data; // array
    if (isset($data['value'])) return json_decode($data['value'], true) ?? [];
    return [];
}

function writeUsers(array $users): void {
    kvWrite('smm_users', $users);
}

function creditUser(string $userId, float $amount): bool {
    $users = readUsers();
    foreach ($users as &$u) {
        if ($u['id'] === $userId || $u['email'] === $userId) {
            $u['balance'] = round(($u['balance'] ?? 0) + $amount, 2);
            writeUsers($users);
            return true;
        }
    }
    return false;
}

function shopierCheckOrders(string $productId): bool {
    // Try orders endpoint
    $orders = shopierRequest('GET', '/orders?product_id=' . $productId . '&limit=10');
    if ($orders) {
        $list = isset($orders[0]) ? $orders : ($orders['data'] ?? $orders['orders'] ?? []);
        foreach ($list as $o) {
            if (in_array($o['status'] ?? '', ['paid', 'completed']) || ($o['paymentStatus'] ?? '') === 'paid') return true;
        }
    }
    // Fallback: check product stock
    $prod = shopierRequest('GET', '/products/' . $productId);
    if ($prod && (($prod['stockQuantity'] ?? 1) === 0)) return true;
    return false;
}

// ── Route dispatch ───────────────────────────────────────────────────────────
$path = $_SERVER['PATH_INFO'] ?? parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api-shopier.php', '', $path);

// ── POST /create-product ─────────────────────────────────────────────────────
if ($path === '/create-product' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $amount = floatval($body['amount'] ?? 0);
    if ($amount < 10 || $amount > 5000) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'message' => 'Tutar 10 TL ile 5.000 TL arasında olmalıdır.']);
        exit;
    }
    $cfg = shopierConfig();
    if (!$cfg || empty($cfg['apiKey'])) {
        http_response_code(503);
        echo json_encode(['ok' => false, 'message' => 'Shopier entegrasyonu aktif değil.']);
        exit;
    }
    $userId    = $body['userId']    ?? '';
    $userName  = $body['userName']  ?? '';
    $ref       = generateRef();
    $imageUrl  = $cfg['productImageUrl'] ?? 'https://www.gstatic.com/webp/gallery/1.jpg';
    $product   = shopierRequest('POST', '/products', [
        'title'         => 'Bakiye Yüklemesi - ' . number_format($amount, 2) . ' TL - ' . $userId,
        'type'          => 'digital',
        'media'         => [['url' => $imageUrl, 'type' => 'image', 'placement' => 1]],
        'priceData'     => ['price' => $amount, 'currency' => 'TRY'],
        'shippingPayer' => 'sellerPays',
        'stockQuantity' => 1,
    ]);
    if (!$product || empty($product['id'])) {
        http_response_code(502);
        echo json_encode(['ok' => false, 'message' => 'Shopier ürün oluşturulamadı.']);
        exit;
    }
    $payments = kvRead('smm_shopier_payments') ?? [];
    $payments[$ref] = [
        'shopierProductId'  => (string)$product['id'],
        'shopierProductUrl' => $product['url'],
        'userId'            => $userId,
        'userName'          => $userName,
        'amount'            => $amount,
        'status'            => 'pending',
        'createdAt'         => date('c'),
        'processedAt'       => null,
    ];
    kvWrite('smm_shopier_payments', $payments);
    echo json_encode(['ok' => true, 'url' => $product['url'], 'ref' => $ref]);
    exit;
}

// ── GET /check-payment?ref=XXX ───────────────────────────────────────────────
if ($path === '/check-payment' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $ref = $_GET['ref'] ?? '';
    if (!$ref) { http_response_code(400); echo json_encode(['ok' => false, 'message' => 'ref gerekli']); exit; }
    $payments = kvRead('smm_shopier_payments') ?? [];
    if (!isset($payments[$ref])) { http_response_code(404); echo json_encode(['ok' => false, 'status' => 'not_found']); exit; }
    $payment = $payments[$ref];
    if ($payment['status'] === 'completed') {
        echo json_encode(['ok' => true, 'status' => 'already_processed', 'amount' => $payment['amount']]);
        exit;
    }
    $paid = shopierCheckOrders($payment['shopierProductId']);
    if ($paid) {
        creditUser($payment['userId'], $payment['amount']);
        $payments[$ref]['status'] = 'completed';
        $payments[$ref]['processedAt'] = date('c');
        kvWrite('smm_shopier_payments', $payments);
        echo json_encode(['ok' => true, 'status' => 'completed', 'amount' => $payment['amount']]);
    } else {
        echo json_encode(['ok' => true, 'status' => 'pending', 'amount' => $payment['amount']]);
    }
    exit;
}

// ── POST /webhook ────────────────────────────────────────────────────────────
if ($path === '/webhook' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $payload = json_decode(file_get_contents('php://input'), true) ?? [];
    error_log('[Shopier Webhook] ' . json_encode($payload));
    $productId = (string)($payload['product_id'] ?? $payload['productId'] ?? $payload['item_id'] ?? '');
    if ($productId) {
        $payments = kvRead('smm_shopier_payments') ?? [];
        foreach ($payments as $ref => &$payment) {
            if ($payment['shopierProductId'] === $productId && $payment['status'] === 'pending') {
                $paid = shopierCheckOrders($productId);
                if ($paid) {
                    creditUser($payment['userId'], $payment['amount']);
                    $payment['status'] = 'completed';
                    $payment['processedAt'] = date('c');
                    kvWrite('smm_shopier_payments', $payments);
                }
                break;
            }
        }
    }
    echo 'ok';
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
