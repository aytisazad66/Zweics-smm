<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$input = json_decode(file_get_contents('php://input'), true) ?: [];

$DEFAULT_EMAIL = 'admin@bormedya.com';
$DEFAULT_PASS  = 'Admin123!';

$DATA_DIR  = __DIR__ . '/data';
$CRED_FILE = $DATA_DIR . '/smm_admin_credentials.json';

function readCredentials($file, $defaultEmail, $defaultPass) {
    if (file_exists($file)) {
        $raw = @file_get_contents($file);
        if ($raw) {
            $d = json_decode($raw, true);
            if (isset($d['email'], $d['password'])) return $d;
        }
    }
    return ['email' => $defaultEmail, 'password' => $defaultPass];
}

$action = trim($input['action'] ?? $_GET['action'] ?? '');

if ($action === 'login' || !$action) {
    $email    = trim($input['email'] ?? '');
    $password = trim($input['password'] ?? '');

    if (!$email || !$password) {
        echo json_encode(['ok' => false, 'message' => 'E-posta ve şifre zorunludur.']);
        exit;
    }

    $stored = readCredentials($CRED_FILE, $DEFAULT_EMAIL, $DEFAULT_PASS);

    if ($email === $stored['email'] && $password === $stored['password']) {
        echo json_encode(['ok' => true]);
    } else {
        echo json_encode(['ok' => false, 'message' => 'E-posta veya şifre hatalı.']);
    }
    exit;
}

if ($action === 'set-credentials') {
    $currentPassword = trim($input['currentPassword'] ?? '');
    $newEmail        = trim($input['newEmail'] ?? '');
    $newPassword     = trim($input['newPassword'] ?? '');

    if (!$currentPassword) {
        echo json_encode(['ok' => false, 'message' => 'Mevcut şifre zorunludur.']);
        exit;
    }

    $stored = readCredentials($CRED_FILE, $DEFAULT_EMAIL, $DEFAULT_PASS);

    if ($currentPassword !== $stored['password']) {
        echo json_encode(['ok' => false, 'message' => 'Mevcut şifre yanlış.']);
        exit;
    }

    $updated = [
        'email'    => $newEmail    ?: $stored['email'],
        'password' => $newPassword ?: $stored['password'],
    ];

    if (!is_dir($DATA_DIR)) {
        @mkdir($DATA_DIR, 0755, true);
    }

    if (file_put_contents($CRED_FILE, json_encode($updated)) === false) {
        echo json_encode(['ok' => false, 'message' => 'Dosyaya yazılamadı.']);
        exit;
    }

    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'message' => 'Bilinmeyen işlem.']);
