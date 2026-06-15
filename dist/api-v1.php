<?php
/**
 * Bor Media SMM Panel — REST API v1
 * Endpoint: https://bormedya.com/api-v1.php
 *
 * Tüm istekler POST olarak gönderilir (application/x-www-form-urlencoded veya JSON)
 * Zorunlu parametre: key (API anahtarı)
 *
 * Desteklenen action değerleri:
 *   services  — Aktif servis listesini döner
 *   add_order — Yeni sipariş oluşturur
 *   status    — Sipariş durumu sorgular
 *   balance   — Bakiye sorgular
 */

@ini_set('post_max_size',       '16M');
@ini_set('memory_limit',        '128M');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Cache-Control: no-store, no-cache');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// ── Yardımcı Fonksiyonlar ─────────────────────────────────────────────────────

$DATA_DIR = __DIR__ . '/data';

function readJson(string $file): ?array {
    if (!file_exists($file)) return null;
    $raw = @file_get_contents($file);
    if (!$raw) return null;
    $decoded = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) return null;
    // KV wrapper: {"value":"...JSON..."} veya düz array
    if (isset($decoded['value']) && is_string($decoded['value'])) {
        $inner = json_decode($decoded['value'], true);
        return (json_last_error() === JSON_ERROR_NONE) ? $inner : $decoded;
    }
    return $decoded;
}

function writeJson(string $file, $data): bool {
    $dir = dirname($file);
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    return file_put_contents($file, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX) !== false;
}

function apiError(string $message, int $code = 200): void {
    echo json_encode(['error' => $message]);
    exit;
}

// ── İstek Parametreleri ───────────────────────────────────────────────────────

// Form-data veya JSON body
$input = [];
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (strpos($contentType, 'application/json') !== false) {
    $body = file_get_contents('php://input');
    $input = json_decode($body, true) ?: [];
} else {
    // application/x-www-form-urlencoded veya GET
    $input = array_merge($_GET, $_POST);
    $rawBody = file_get_contents('php://input');
    if ($rawBody) {
        parse_str($rawBody, $parsed);
        $input = array_merge($input, $parsed);
    }
}

$apiKey = trim($input['key'] ?? '');
$action = trim($input['action'] ?? '');

// ── API Key Doğrulama ─────────────────────────────────────────────────────────

if (!$apiKey) {
    apiError('API anahtarı eksik. key parametresini gönderin.');
}

$usersFile = $DATA_DIR . '/smm_users.json';
$users = readJson($usersFile) ?: [];

$authUser = null;
foreach ($users as $u) {
    if (isset($u['apiKey']) && $u['apiKey'] === $apiKey) {
        $authUser = $u;
        break;
    }
}

if (!$authUser) {
    apiError('Geçersiz API anahtarı.');
}

if (($authUser['status'] ?? 'active') !== 'active') {
    apiError('Hesabınız askıya alınmış. Destek ile iletişime geçin.');
}

// ── Aksiyonlar ────────────────────────────────────────────────────────────────

// ── 1. services ───────────────────────────────────────────────────────────────
if ($action === 'services') {
    $servicesFile = $DATA_DIR . '/smm_services.json';
    $services = readJson($servicesFile) ?: [];
    $result = [];
    foreach ($services as $s) {
        if (($s['status'] ?? 'active') !== 'active') continue;
        $result[] = [
            'service'      => (string)($s['id'] ?? ''),
            'name'         => $s['name'] ?? '',
            'type'         => 'Default',
            'category'     => $s['platform'] ?? '',
            'rate'         => number_format((float)($s['pricePer1000'] ?? 0), 2, '.', ''),
            'min'          => (int)($s['min'] ?? 10),
            'max'          => (int)($s['max'] ?? 100000),
            'description'  => $s['description'] ?? '',
            'delivery_speed' => $s['deliverySpeed'] ?? '',
        ];
    }
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    exit;
}

// ── 2. balance ────────────────────────────────────────────────────────────────
if ($action === 'balance') {
    echo json_encode([
        'balance'  => number_format((float)($authUser['balance'] ?? 0), 2, '.', ''),
        'currency' => 'TRY',
    ]);
    exit;
}

// ── 3. add_order ─────────────────────────────────────────────────────────────
if ($action === 'add_order') {
    $serviceId = trim($input['service'] ?? '');
    $link      = trim($input['link'] ?? '');
    $quantity  = (int)($input['quantity'] ?? 0);

    if (!$serviceId || !$link || $quantity <= 0) {
        apiError('Zorunlu parametreler eksik: service, link, quantity');
    }

    // Servisi bul
    $servicesFile = $DATA_DIR . '/smm_services.json';
    $services = readJson($servicesFile) ?: [];
    $service = null;
    foreach ($services as $s) {
        if ((string)($s['id'] ?? '') === (string)$serviceId) {
            $service = $s;
            break;
        }
    }
    if (!$service) apiError('Servis bulunamadı: ' . $serviceId);
    if (($service['status'] ?? 'active') !== 'active') apiError('Bu servis şu anda aktif değil.');

    $min = (int)($service['min'] ?? 10);
    $max = (int)($service['max'] ?? 100000);
    if ($quantity < $min || $quantity > $max) {
        apiError("Miktar $min ile $max arasında olmalıdır.");
    }

    // Ücret hesapla
    $rate   = (float)($service['pricePer1000'] ?? 0);
    $charge = round($rate * $quantity / 1000, 2);

    // Bakiye kontrolü
    $balance = (float)($authUser['balance'] ?? 0);
    if ($balance < $charge) {
        apiError('Yetersiz bakiye. Mevcut: ' . number_format($balance, 2) . ' TRY, Gereken: ' . number_format($charge, 2) . ' TRY');
    }

    // Sipariş oluştur
    $ordersFile = $DATA_DIR . '/smm_orders.json';
    $orders = readJson($ordersFile) ?: [];

    $orderId = 'ORD-' . str_pad(count($orders) + 1, 5, '0', STR_PAD_LEFT);
    $newOrder = [
        'id'          => $orderId,
        'userId'      => $authUser['id'],
        'username'    => $authUser['email'],
        'serviceId'   => $serviceId,
        'serviceName' => $service['name'],
        'platform'    => $service['platform'] ?? '',
        'quantity'    => $quantity,
        'charge'      => $charge,
        'status'      => 'Bekliyor',
        'date'        => date('Y-m-d'),
        'link'        => $link,
        'logs'        => [['time' => date('H:i'), 'text' => 'API üzerinden sipariş oluşturuldu.']],
        'source'      => 'api',
    ];
    $orders[] = $newOrder;

    // Kullanıcı bakiyesini düş
    foreach ($users as &$u) {
        if ($u['id'] === $authUser['id']) {
            $u['balance'] = round((float)$u['balance'] - $charge, 2);
            $u['totalOrders'] = (int)($u['totalOrders'] ?? 0) + 1;
            break;
        }
    }
    unset($u);

    // Kaydet
    if (!writeJson($ordersFile, $orders)) apiError('Sipariş kaydedilemedi.');
    writeJson($usersFile, $users);

    echo json_encode(['order' => $orderId]);
    exit;
}

// ── 4. status ────────────────────────────────────────────────────────────────
if ($action === 'status') {
    $orderId = trim($input['order'] ?? '');
    if (!$orderId) apiError('order parametresi zorunludur.');

    $ordersFile = $DATA_DIR . '/smm_orders.json';
    $orders = readJson($ordersFile) ?: [];

    $found = null;
    foreach ($orders as $o) {
        if (($o['id'] ?? '') === $orderId) {
            // Sadece kendi siparişini görebilsin
            if (($o['userId'] ?? '') !== $authUser['id']) break;
            $found = $o;
            break;
        }
    }

    if (!$found) apiError('Sipariş bulunamadı: ' . $orderId);

    $statusMap = [
        'Bekliyor'  => 'Pending',
        'İşlemde'   => 'In progress',
        'Tamamlandı'=> 'Completed',
        'İptal'     => 'Canceled',
    ];

    echo json_encode([
        'charge'     => number_format((float)($found['charge'] ?? 0), 2, '.', ''),
        'start_count'=> '0',
        'status'     => $statusMap[$found['status'] ?? 'Bekliyor'] ?? 'Pending',
        'remains'    => (string)($found['quantity'] ?? 0),
        'currency'   => 'TRY',
    ]);
    exit;
}

// ── Bilinmeyen aksiyon ────────────────────────────────────────────────────────
apiError('Geçersiz action. Desteklenen: services, add_order, status, balance');
