<?php
/**
 * TurkPaneli.com SMM API Secure CORS Bypass Proxy
 * Designed for cPanel Shared Hosting (No VDS/Node required)
 */

// Allow cross-origin requests from your subdomains / domains
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-SMM-Provider");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 1. Get SMM API endpoint target
$targetUrl = isset($_REQUEST['url']) ? trim($_REQUEST['url']) : 'https://turkpaneli.com/api/v2';

// 2. Validate URL format
if (!filter_var($targetUrl, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid target SMM URL."]);
    exit;
}

// 3. Prepare parameters to post
$fields = [];
foreach ($_POST as $key => $value) {
    $fields[$key] = $value;
}

// Support JSON input format if SMM ever expects it
if (empty($fields)) {
    $input = file_get_contents('php://input');
    $decoded = json_decode($input, true);
    if (is_array($decoded)) {
        $fields = $decoded;
    }
}

// 4. Fire cURL Request to TurkPaneli / SMM Provider
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($fields)); // standard SMM Form post
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);                 // secure connection fallback
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);                           // timeout safety

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode([
        "error" => "cURL Connection Failed",
        "details" => curl_error($ch)
    ]);
} else {
    http_response_code($httpCode);
    // Directly output the exact response received from the SMM provider
    echo $response;
}

curl_close($ch);
