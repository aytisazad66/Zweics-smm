<?php
/**
 * Bor Media SMM Panel — KV Store (cPanel / Shared Hosting)
 * GET  /api/kv/{key}  → JSON veri döndürür
 * POST /api/kv/{key}  → JSON veri kaydeder
 */

@ini_set('post_max_size',       '32M');
@ini_set('upload_max_filesize', '32M');
@ini_set('memory_limit',        '128M');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Cache-Control: no-store, no-cache');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// ── Güvenlik: Yalnızca panel içi istekler (X-Requested-With) kabul edilir ──
$xrw = isset($_SERVER['HTTP_X_REQUESTED_WITH']) ? strtolower(trim($_SERVER['HTTP_X_REQUESTED_WITH'])) : '';
if ($xrw !== 'xmlhttprequest') {
    http_response_code(403);
    echo json_encode(['error' => 'Direct access forbidden']);
    exit;
}

$key = isset($_GET['key']) ? preg_replace('/[^a-zA-Z0-9_]/', '', trim($_GET['key'])) : '';

if (!$key) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or missing key']);
    exit;
}

// ── Hassas anahtarlar: GET isteğiyle hiçbir zaman dışarıya verilmez ──
$BLOCKED_GET_KEYS = [
    'smm_admin_credentials',
];

if ($_SERVER['REQUEST_METHOD'] === 'GET' && in_array($key, $BLOCKED_GET_KEYS, true)) {
    http_response_code(403);
    echo json_encode(['error' => 'Access denied']);
    exit;
}

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

$file = $dataDir . '/' . $key . '.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($file)) {
        echo file_get_contents($file);
    } else {
        echo json_encode(['value' => null]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = file_get_contents('php://input');
    if ($body === false || $body === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Empty body']);
        exit;
    }
    if (file_put_contents($file, $body, LOCK_EX) === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Could not write data file']);
        exit;
    }
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
