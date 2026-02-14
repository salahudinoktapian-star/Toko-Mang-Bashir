<?php
require_once 'config.php';

$db = getDB();
$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'sync':
        syncCart($db, $input);
        break;
    case 'get':
        getCart($db, $input['user_id']);
        break;
    case 'merge':
        mergeCart($db, $input);
        break;
    default:
        jsonResponse(['error' => 'Invalid action'], 400);
}

function syncCart($db, $data) {
    $userId = intval($data['user_id']);
    $cart = $data['cart'] ?? [];
    
    // Clear existing cart
    $stmt = $db->prepare("DELETE FROM cart_items WHERE user_id = :uid");
    $stmt->execute([':uid' => $userId]);
    
    // Insert new items
    $sql = "INSERT INTO cart_items (user_id, product_id, quantity, variants, added_at) 
            VALUES (:uid, :pid, :qty, :var, NOW())";
    $stmt = $db->prepare($sql);
    
    foreach ($cart as $item) {
        $stmt->execute([
            ':uid' => $userId,
            ':pid' => intval($item['id']),
            ':qty' => intval($item['quantity']),
            ':var' => json_encode($item['variants'] ?? [])
        ]);
    }
    
    jsonResponse(['success' => true, 'items_synced' => count($cart)]);
}

function getCart($db, $userId) {
    $sql = "SELECT c.*, p.name, p.price, p.image, p.stock 
            FROM cart_items c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = :uid";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([':uid' => intval($userId)]);
    $items = $stmt->fetchAll();
    
    foreach ($items as &$item) {
        $item['variants'] = json_decode($item['variants'], true);
    }
    
    jsonResponse(['cart' => $items]);
}

function mergeCart($db, $data) {
    // Merge local cart with server cart on login
    $userId = intval($data['user_id']);
    $localCart = $data['local_cart'] ?? [];
    
    // Get server cart
    $serverCart = getCartData($db, $userId);
    
    // Merge logic
    $merged = [];
    $productIds = [];
    
    // Add server items
    foreach ($serverCart as $item) {
        $key = $item['product_id'] . json_encode($item['variants']);
        $merged[$key] = $item;
        $productIds[] = $item['product_id'];
    }
    
    // Add/merge local items
    foreach ($localCart as $item) {
        $key = $item['id'] . json_encode($item['variants'] ?? []);
        
        if (isset($merged[$key])) {
            $merged[$key]['quantity'] += $item['quantity'];
        } else {
            $merged[$key] = [
                'product_id' => $item['id'],
                'quantity' => $item['quantity'],
                'variants' => $item['variants'] ?? [],
                'name' => $item['name'],
                'price' => $item['price'],
                'image' => $item['image']
            ];
        }
    }
    
    // Save merged cart
    syncCart($db, [
        'user_id' => $userId,
        'cart' => array_values($merged)
    ]);
    
    jsonResponse(['success' => true, 'cart' => array_values($merged)]);
}

function getCartData($db, $userId) {
    $sql = "SELECT * FROM cart_items WHERE user_id = :uid";
    $stmt = $db->prepare($sql);
    $stmt->execute([':uid' => $userId]);
    return $stmt->fetchAll();
}
?>