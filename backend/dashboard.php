<?php
require_once __DIR__ . '/db.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}


// Check Authorization header for token
function get_bearer_token() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER['Authorization']);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { // Nginx or fast CGI
        $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        // Server-side fix for bug in apache_request_headers
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    if (!empty($headers)) {
        if (preg_match('/Bearer\s+(\S+)/', $headers, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

$token = get_bearer_token();
$payload = verify_token($token);
if (!$payload || !isset($payload['sub'])) {
    http_response_code(401);
    jsonResponse(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$userId = $payload['sub'];

$pdo = db_connect();

// Fetch user
$stmt = $pdo->prepare('SELECT id, name, email, avatar, level, xp, streak, join_date FROM users WHERE id = ? LIMIT 1');
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user) {
    jsonResponse(['success' => false, 'message' => 'User not found']);
    exit;
}

// Fetch lessons and user's progress
$lessonsStmt = $pdo->query('SELECT id, title, is_locked FROM lessons ORDER BY id ASC');
$lessons = $lessonsStmt->fetchAll();

$progressStmt = $pdo->prepare('SELECT lesson_id, progress, completed FROM user_lessons WHERE user_id = ?');
$progressStmt->execute([$userId]);
$progressRows = $progressStmt->fetchAll();
$progressMap = [];
foreach ($progressRows as $p) {
    $progressMap[$p['lesson_id']] = $p;
}

$lessonsOut = [];
foreach ($lessons as $l) {
    $pid = $l['id'];
    $p = $progressMap[$pid] ?? null;
    $lessonsOut[] = [
        'id' => (int)$l['id'],
        'title' => $l['title'],
        'progress' => $p ? (int)$p['progress'] : 0,
        'completed' => $p ? boolval($p['completed']) : false,
        'locked' => boolval($l['is_locked']),
    ];
}

// Achievements
$achStmt = $pdo->query('SELECT id, title, icon FROM achievements ORDER BY id ASC');
$achievements = $achStmt->fetchAll();

$userAchStmt = $pdo->prepare('SELECT achievement_id FROM user_achievements WHERE user_id = ?');
$userAchStmt->execute([$userId]);
$userAchRows = $userAchStmt->fetchAll();
$userAchMap = array_column($userAchRows, 'achievement_id');

$achOut = [];
foreach ($achievements as $a) {
    $achOut[] = [
        'id' => (int)$a['id'],
        'title' => $a['title'],
        'icon' => $a['icon'],
        'unlocked' => in_array($a['id'], $userAchMap),
    ];
}

// Stats
$stats = [
    'xp' => (int)$user['xp'],
    'streak' => (int)$user['streak'],
    'level' => $user['level'],
];

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

jsonResponse([
    'success' => true,
    'user' => $respUser,
    'lessons' => $lessonsOut,
    'achievements' => $achOut,
    'stats' => $stats,
]);

?>
