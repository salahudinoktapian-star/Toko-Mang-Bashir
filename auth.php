<?php
require_once 'config.php';

$db = getDB();
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'register':
        register($db, $_POST);
        break;
    case 'login':
        login($db, $_POST);
        break;
    case 'logout':
        logout();
        break;
    case 'profile':
        getProfile($db, intval($_GET['user_id']));
        break;
    case 'update':
        updateProfile($db, getJsonInput());
        break;
    default:
        jsonResponse(['error' => 'Invalid action'], 400);
}

function register($db, $data) {
    $name = sanitize($data['fullname']);
    $email = sanitize($data['email']);
    $phone = sanitize($data['phone']);
    $password = $data['password'];
    
    // Validation
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Email tidak valid'], 400);
    }
    
    if (strlen($password) < 6) {
        jsonResponse(['error' => 'Password minimal 6 karakter'], 400);
    }
    
    // Check existing email
    $stmt = $db->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'Email sudah terdaftar'], 400);
    }
    
    // Hash password
    $hash = password_hash($password, PASSWORD_BCRYPT);
    
    $sql = "INSERT INTO users (name, email, phone, password, created_at) 
            VALUES (:name, :email, :phone, :pass, NOW())";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':phone' => $phone,
        ':pass' => $hash
    ]);
    
    $userId = $db->lastInsertId();
    
    // Generate token
    $token = generateJWT(['user_id' => $userId, 'email' => $email]);
    
    jsonResponse([
        'success' => true,
        'user_id' => $userId,
        'token' => $token
    ]);
}

function login($db, $data) {
    $email = sanitize($data['email']);
    $password = $data['password'];
    
    $sql = "SELECT id, name, email, phone, password, avatar 
            FROM users 
            WHERE email = :email AND status = 'active'";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($password, $user['password'])) {
        jsonResponse(['error' => 'Email atau password salah'], 401);
    }
    
    // Update last login
    $stmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE id = :id");
    $stmt->execute([':id' => $user['id']]);
    
    // Generate token
    $token = generateJWT([
        'user_id' => $user['id'],
        'email' => $user['email']
    ]);
    
    unset($user['password']);
    
    jsonResponse([
        'success' => true,
        'user' => $user,
        'token' => $token
    ]);
}

function logout() {
    // Client-side token removal
    jsonResponse(['success' => true]);
}

function getProfile($db, $userId) {
    $sql = "SELECT id, name, email, phone, avatar, created_at 
            FROM users 
            WHERE id = :id";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        jsonResponse(['error' => 'User not found'], 404);
    }
    
    // Get order stats
    $sql = "SELECT 
                COUNT(*) as total_orders,
                SUM(total) as total_spent
            FROM orders 
            WHERE user_id = :uid AND status != 'cancelled'";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([':uid' => $userId]);
    $stats = $stmt->fetch();
    
    $user['stats'] = $stats;
    
    jsonResponse($user);
}

function updateProfile($db, $data) {
    $userId = intval($data['user_id']);
    $allowedFields = ['name', 'phone', 'avatar'];
    $updates = [];
    $params = [':id' => $userId];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $updates[] = "$field = :$field";
            $params[":$field"] = sanitize($data[$field]);
        }
    }
    
    if (empty($updates)) {
        jsonResponse(['error' => 'No fields to update'], 400);
    }
    
    $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    jsonResponse(['success' => true]);
}
?>