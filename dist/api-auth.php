<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$DATA_DIR  = __DIR__ . '/data';
$CRED_FILE = $DATA_DIR . '/smm_admin_credentials.json';

$DEFAULT_EMAIL = 'admin@bormedya.com';
$DEFAULT_PASS  = 'Admin123!';

function jsonOut($data) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

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

function readGoogleConfig($dataDir) {
    $f = $dataDir . '/smm_google_oauth_config.json';
    if (!file_exists($f)) return [];
    $raw = @file_get_contents($f);
    if (!$raw) return [];
    $outer = json_decode($raw, true);
    if (!isset($outer['value'])) return [];
    return json_decode($outer['value'], true) ?: [];
}

function readUsers($dataDir) {
    $f = $dataDir . '/smm_users.json';
    if (!file_exists($f)) return [];
    $raw = @file_get_contents($f);
    if (!$raw) return [];
    $outer = json_decode($raw, true);
    if (!isset($outer['value'])) return [];
    return json_decode($outer['value'], true) ?: [];
}

function writeUsers($dataDir, $users) {
    $f = $dataDir . '/smm_users.json';
    file_put_contents($f, json_encode(['value' => json_encode($users)]), LOCK_EX);
}

$input  = json_decode(file_get_contents('php://input'), true) ?: [];
$action = trim($input['action'] ?? $_GET['action'] ?? '');

// ── Admin login ──────────────────────────────────────────────────────────────
if ($action === 'login' || !$action) {
    $email    = trim($input['email'] ?? '');
    $password = trim($input['password'] ?? '');
    if (!$email || !$password) {
        jsonOut(['ok' => false, 'message' => 'E-posta ve şifre zorunludur.']);
    }
    $stored = readCredentials($CRED_FILE, $DEFAULT_EMAIL, $DEFAULT_PASS);
    if ($email === $stored['email'] && $password === $stored['password']) {
        jsonOut(['ok' => true]);
    }
    jsonOut(['ok' => false, 'message' => 'E-posta veya şifre hatalı.']);
}

// ── Admin set-credentials ────────────────────────────────────────────────────
if ($action === 'set-credentials') {
    $currentPassword = trim($input['currentPassword'] ?? '');
    $newEmail        = trim($input['newEmail'] ?? '');
    $newPassword     = trim($input['newPassword'] ?? '');
    if (!$currentPassword) {
        jsonOut(['ok' => false, 'message' => 'Mevcut şifre zorunludur.']);
    }
    $stored = readCredentials($CRED_FILE, $DEFAULT_EMAIL, $DEFAULT_PASS);
    if ($currentPassword !== $stored['password']) {
        jsonOut(['ok' => false, 'message' => 'Mevcut şifre yanlış.']);
    }
    $updated = [
        'email'    => $newEmail    ?: $stored['email'],
        'password' => $newPassword ?: $stored['password'],
    ];
    if (!is_dir($DATA_DIR)) @mkdir($DATA_DIR, 0755, true);
    if (file_put_contents($CRED_FILE, json_encode($updated)) === false) {
        jsonOut(['ok' => false, 'message' => 'Dosyaya yazılamadı.']);
    }
    jsonOut(['ok' => true]);
}

// ── GET /api/auth/google/config — returns { enabled, clientId } ──────────────
if ($action === 'google_config') {
    header('Content-Type: application/json; charset=utf-8');
    $cfg = readGoogleConfig($DATA_DIR);
    echo json_encode([
        'enabled'  => !empty($cfg['enabled']),
        'clientId' => $cfg['clientId'] ?? '',
    ]);
    exit;
}

// ── GET /api/auth/google/callback — OAuth2 code exchange ────────────────────
if ($action === 'google_callback') {
    $code       = $_GET['code']  ?? '';
    $oauthError = $_GET['error'] ?? '';

    if ($oauthError || !$code) {
        header('Location: /?gauth_error=cancelled');
        exit;
    }

    $cfg = readGoogleConfig($DATA_DIR);
    if (empty($cfg['enabled']) || empty($cfg['clientId']) || empty($cfg['clientSecret'])) {
        header('Location: /?gauth_error=not_configured');
        exit;
    }

    // Build redirect URI — same as what Google Console has
    $host     = $_SERVER['HTTP_HOST'] ?? 'bormedya.com';
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $redirectUri = $protocol . '://' . $host . '/api/auth/google/callback';

    // Exchange code for access token
    $tokenResp = @file_get_contents('https://oauth2.googleapis.com/token', false, stream_context_create([
        'http' => [
            'method'  => 'POST',
            'header'  => 'Content-Type: application/x-www-form-urlencoded',
            'content' => http_build_query([
                'code'          => $code,
                'client_id'     => $cfg['clientId'],
                'client_secret' => $cfg['clientSecret'],
                'redirect_uri'  => $redirectUri,
                'grant_type'    => 'authorization_code',
            ]),
        ],
    ]));

    if (!$tokenResp) {
        header('Location: /?gauth_error=token_failed');
        exit;
    }

    $tokenData = json_decode($tokenResp, true);
    if (empty($tokenData['access_token'])) {
        header('Location: /?gauth_error=token_failed');
        exit;
    }

    // Fetch user profile
    $profileResp = @file_get_contents('https://www.googleapis.com/oauth2/v2/userinfo', false, stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => 'Authorization: Bearer ' . $tokenData['access_token'],
        ],
    ]));

    if (!$profileResp) {
        header('Location: /?gauth_error=server_error');
        exit;
    }

    $profile = json_decode($profileResp, true);
    $email   = $profile['email'] ?? '';
    $name    = $profile['name']  ?? '';

    if (!$email) {
        header('Location: /?gauth_error=no_email');
        exit;
    }

    // Find or create user
    $users = readUsers($DATA_DIR);
    $user  = null;
    foreach ($users as $u) {
        if (strtolower($u['email'] ?? '') === strtolower($email)) {
            $user = $u;
            break;
        }
    }

    if (!$user) {
        // Create new user
        $maxId = 100;
        foreach ($users as $u) {
            $id = intval($u['id'] ?? 0);
            if ($id > $maxId) $maxId = $id;
        }
        $user = [
            'id'          => (string)($maxId + 1),
            'fullName'    => $name ?: explode('@', $email)[0],
            'email'       => $email,
            'balance'     => 0,
            'totalOrders' => 0,
            'joinedDate'  => date('Y-m-d'),
            'status'      => 'active',
        ];
        $users[] = $user;
        writeUsers($DATA_DIR, $users);
    } elseif (($user['status'] ?? 'active') === 'suspended') {
        header('Location: /?gauth_error=suspended');
        exit;
    }

    header('Location: /?gauth_uid=' . urlencode($user['id']));
    exit;
}

jsonOut(['ok' => false, 'message' => 'Bilinmeyen işlem.']);
