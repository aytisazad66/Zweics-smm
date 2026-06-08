<?php
/**
 * SMM Panel - Dual Provider Secure API Proxy
 * cPanel Shared Hosting Compatible (No VDS/Node required)
 * Supports: turkpaneli.com (TR Users) & resellerprovider.com (Global Users)
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-SMM-Provider");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Whitelisted SMM API endpoints only
$ALLOWED_URLS = [
    'https://turkpaneli.com/api/v2',
    'https://resellerprovider.com/api/v2',
];

// 1. Get target URL from request
$targetUrl = isset($_REQUEST['url']) ? trim($_REQUEST['url']) : '';

if (empty($targetUrl)) {
    http_response_code(400);
    echo json_encode(["error" => "Missing target URL parameter."]);
    exit;
}

// 2. Validate URL format
if (!filter_var($targetUrl, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid URL format."]);
    exit;
}

// 3. Enforce whitelist — only approved SMM providers allowed
$isAllowed = false;
foreach ($ALLOWED_URLS as $allowed) {
    if (strpos($targetUrl, $allowed) === 0) {
        $isAllowed = true;
        break;
    }
}

if (!$isAllowed) {
    http_response_code(403);
    echo json_encode(["error" => "URL not in approved provider whitelist."]);
    exit;
}

// 4. Build POST fields
$fields = [];
foreach ($_POST as $key => $value) {
    $fields[$key] = $value;
}

// Support JSON body format
if (empty($fields)) {
    $input = file_get_contents('php://input');
    $decoded = json_decode($input, true);
    if (is_array($decoded)) {
        $fields = $decoded;
    }
}

// 5. cURL request to SMM provider
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($fields));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 20);
curl_setopt($ch, CURLOPT_USERAGENT, 'SMM-Panel-Proxy/2.0');

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode([
        "error" => "Provider connection failed",
        "details" => curl_error($ch)
    ]);
} else {
    http_response_code($httpCode);
    echo $response;
}

curl_close($ch);
