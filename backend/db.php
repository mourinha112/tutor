<?php
// Simple PDO connection. Copy to your server and update credentials.
function db_connect() {
    $host = 'localhost';
    $db   = 'sakae_tutor';
    $user = 'root';
    $pass = '';
    $charset = 'utf8mb4';

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
         return new PDO($dsn, $user, $pass, $options);
    } catch (PDOException $e) {
         http_response_code(500);
         echo json_encode(['success' => false, 'message' => 'DB connection failed']);
         exit;
    }
}

function jsonResponse($data) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
}

// Simple token generation/verification (HMAC-based JWT-like compact token)
// NOTE: For production use a proper JWT library. This is a lightweight alternative.
function token_secret() {
    // Change this to a secure secret in production and keep it out of source control
    return 'replace_this_with_a_very_secure_and_random_secret';
}

function generate_token($userId) {
    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64_encode(json_encode(['sub' => $userId, 'iat' => time(), 'exp' => time() + 60*60*24*7]));
    $sig = hash_hmac('sha256', "$header.$payload", token_secret(), true);
    $sig_enc = strtr(base64_encode($sig), '+/', '-_');
    return rtrim($header, '=') . '.' . rtrim($payload, '=') . '.' . rtrim($sig_enc, '=');
}

function verify_token($token) {
    if (!$token) return false;
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    list($header_b64, $payload_b64, $sig_b64) = $parts;
    $sig = base64_decode(strtr($sig_b64, '-_', '+/'));
    $expected = hash_hmac('sha256', "$header_b64.$payload_b64", token_secret(), true);
    if (!hash_equals($expected, $sig)) return false;
    $payload_json = base64_decode($payload_b64);
    $payload = json_decode($payload_json, true);
    if (!$payload) return false;
    if (isset($payload['exp']) && time() > $payload['exp']) return false;
    return $payload;
}


?>
