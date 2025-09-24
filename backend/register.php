<?php
require_once __DIR__ . '/db.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['name']) || !isset($input['email']) || !isset($input['password'])) {
    http_response_code(400);
    jsonResponse(['success' => false, 'message' => 'Missing name, email or password']);
    exit;
}

$name = trim($input['name']);
$email = trim($input['email']);
$password = $input['password'];

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['success' => false, 'message' => 'Email inválido']);
    exit;
}

$pdo = db_connect();

// Check if email exists
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    jsonResponse(['success' => false, 'message' => 'Email já cadastrado']);
    exit;
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$insert = $pdo->prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
try {
    $insert->execute([$name, $email, $passwordHash]);
    $id = $pdo->lastInsertId();

    $userStmt = $pdo->prepare('SELECT id, name, email, avatar, level, xp, streak, join_date FROM users WHERE id = ? LIMIT 1');
    $userStmt->execute([$id]);
    $user = $userStmt->fetch();

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

    $token = generate_token($id);
    jsonResponse(['success' => true, 'user' => $respUser, 'token' => $token]);
} catch (Exception $e) {
    http_response_code(500);
    jsonResponse(['success' => false, 'message' => 'Erro ao criar usuário']);
}

?>
