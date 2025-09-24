<?php
require_once __DIR__ . '/db.php';

// Allow CORS for development. Adjust origin in production.
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['email']) || !isset($input['password'])) {
    http_response_code(400);
    jsonResponse(['success' => false, 'message' => 'Missing email or password']);
    exit;
}

$email = $input['email'];
$password = $input['password'];

$pdo = db_connect();
$stmt = $pdo->prepare('SELECT id, name, email, password_hash, avatar, level, xp, streak, join_date FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    jsonResponse(['success' => false, 'message' => 'Email não encontrado']);
    exit;
}

// If you seeded demo user with a plain password, you can use a fallback for development
if (!empty($user['password_hash'])) {
    if (!password_verify($password, $user['password_hash'])) {
        jsonResponse(['success' => false, 'message' => 'Senha incorreta']);
        exit;
    }
}

// Prepare response user object (don't return password hash)
$respUser = [
    'id' => (string)$user['id'],
    'name' => $user['name'],
    'email' => $user['email'],
    'avatar' => $user['avatar'],
    'level' => $user['level'],
    'xp' => (int)$user['xp'],
    'streak' => (int)$user['streak'],
    'joinDate' => $user['join_date'],
];

$token = generate_token($user['id']);
jsonResponse(['success' => true, 'user' => $respUser, 'token' => $token]);

?>
