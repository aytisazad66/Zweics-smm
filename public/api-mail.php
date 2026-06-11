<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$input = json_decode(file_get_contents('php://input'), true) ?: [];

$to        = trim($input['to']        ?? '');
$subject   = trim($input['subject']   ?? '');
$body      = trim($input['body']      ?? '');
$smtpHost  = trim($input['smtp_host'] ?? '');
$smtpPort  = intval($input['smtp_port'] ?? 587);
$smtpUser  = trim($input['smtp_user'] ?? '');
$smtpPass  = trim($input['smtp_pass'] ?? '');
$fromName  = trim($input['from_name'] ?? 'Bor Media');

if (!$to || !$subject || !$body) {
    echo json_encode(['ok' => false, 'message' => 'Eksik parametre: to, subject, body zorunlu']);
    exit;
}

// If no SMTP config provided, fall back to PHP mail()
if (!$smtpHost || !$smtpUser || !$smtpPass) {
    $headers  = "From: $fromName <noreply@" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . ">\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $ok = @mail($to, $subject, $body, $headers);
    echo json_encode(['ok' => $ok, 'message' => $ok ? 'mail() ile gönderildi' : 'mail() başarısız']);
    exit;
}

// ── SMTP sender via fsockopen ─────────────────────────────────────────────────
function smtpRead($sock) {
    $buf = '';
    while (!feof($sock)) {
        $line = fgets($sock, 515);
        if ($line === false) break;
        $buf .= $line;
        if (isset($line[3]) && $line[3] === ' ') break;
    }
    return $buf;
}

function smtpCmd($sock, $cmd) {
    fputs($sock, $cmd . "\r\n");
    return smtpRead($sock);
}

$useSSL  = ($smtpPort == 465);
$prefix  = $useSSL ? 'ssl://' : '';
$errno   = 0;
$errstr  = '';

$sock = @fsockopen($prefix . $smtpHost, $smtpPort, $errno, $errstr, 15);
if (!$sock) {
    echo json_encode(['ok' => false, 'message' => "SMTP bağlantı hatası [$errno]: $errstr"]);
    exit;
}
stream_set_timeout($sock, 15);

$resp = smtpRead($sock);
if (substr($resp, 0, 3) !== '220') {
    fclose($sock);
    echo json_encode(['ok' => false, 'message' => "SMTP karşılama hatası: $resp"]);
    exit;
}

$ehlo = smtpCmd($sock, 'EHLO ' . (gethostname() ?: 'localhost'));

// STARTTLS upgrade (port 587)
if (!$useSSL && strpos($ehlo, 'STARTTLS') !== false) {
    $resp = smtpCmd($sock, 'STARTTLS');
    if (substr($resp, 0, 3) === '220') {
        stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
        smtpCmd($sock, 'EHLO ' . (gethostname() ?: 'localhost'));
    }
}

// AUTH LOGIN
smtpCmd($sock, 'AUTH LOGIN');
smtpCmd($sock, base64_encode($smtpUser));
$resp = smtpCmd($sock, base64_encode($smtpPass));
if (substr($resp, 0, 3) !== '235') {
    fclose($sock);
    echo json_encode(['ok' => false, 'message' => "SMTP kimlik hatası: $resp"]);
    exit;
}

// MAIL FROM
$resp = smtpCmd($sock, "MAIL FROM:<$smtpUser>");
if (substr($resp, 0, 3) !== '250') {
    fclose($sock);
    echo json_encode(['ok' => false, 'message' => "MAIL FROM hatası: $resp"]);
    exit;
}

// RCPT TO
$resp = smtpCmd($sock, "RCPT TO:<$to>");
if (substr($resp, 0, 3) !== '250') {
    fclose($sock);
    echo json_encode(['ok' => false, 'message' => "RCPT TO hatası: $resp"]);
    exit;
}

// DATA
smtpCmd($sock, 'DATA');

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$message  = "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <$smtpUser>\r\n";
$message .= "To: <$to>\r\n";
$message .= "Subject: $encodedSubject\r\n";
$message .= "MIME-Version: 1.0\r\n";
$message .= "Content-Type: text/html; charset=UTF-8\r\n";
$message .= "Content-Transfer-Encoding: base64\r\n";
$message .= "X-Mailer: BorMedia-PHP-Mailer\r\n";
$message .= "\r\n";
$message .= chunk_split(base64_encode($body));
$message .= "\r\n.\r\n";

fputs($sock, $message);
$resp = smtpRead($sock);

smtpCmd($sock, 'QUIT');
fclose($sock);

if (substr($resp, 0, 3) === '250') {
    echo json_encode(['ok' => true, 'message' => 'E-posta başarıyla gönderildi.']);
} else {
    echo json_encode(['ok' => false, 'message' => "Gönderme hatası: $resp"]);
}
