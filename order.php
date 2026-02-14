<?php
require_once 'config.php';

$db = getDB();
$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'create':
        createOrder($db, $input);
        break;
    case 'get':
        getOrder($db, intval($_GET['id']));
        break;
    case 'list':
        listOrders($db, intval($_GET['user_id']));
        break;
    case 'update_status':
        updateOrderStatus($db, $input);
        break;
    case 'track':
        trackOrder($db, $_GET['order_number']);
        break;
    default:
        jsonResponse(['error' => 'Invalid action'], 400);
}

function createOrder($db, $data) {
    try {
        $db->beginTransaction();
        
        $orderNumber = generateOrderNumber();
        
        // Insert order
        $sql = "INSERT INTO orders (
                    order_number, user_id, status, 
                    subtotal, shipping_cost, total,
                    shipping_name, shipping_phone, shipping_address,
                    shipping_province, shipping_city, shipping_postal,
                    payment_method, created_at
                ) VALUES (
                    :num, :uid, 'pending',
                    :sub, :ship, :total,
                    :sname, :sphone, :saddr,
                    :sprov, :scity, :spostal,
                    :pay, NOW()
                )";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':num' => $orderNumber,
            ':uid' => intval($data['user_id']),
            ':sub' => floatval($data['subtotal']),
            ':ship' => floatval($data['shipping_cost']),
            ':total' => floatval($data['total']),
            ':sname' => sanitize($data['shipping']['name']),
            ':sphone' => sanitize($data['shipping']['phone']),
            ':saddr' => sanitize($data['shipping']['address']),
            ':sprov' => sanitize($data['shipping']['province']),
            ':scity' => sanitize($data['shipping']['city']),
            ':spostal' => sanitize($data['shipping']['postal']),
            ':pay' => $data['payment_method']
        ]);
        
        $orderId = $db->lastInsertId();
        
        // Insert order items
        $sql = "INSERT INTO order_items (order_id, product_id, quantity, price, variants) 
                VALUES (:oid, :pid, :qty, :price, :var)";
        $stmt = $db->prepare($sql);
        
        foreach ($data['items'] as $item) {
            $stmt->execute([
                ':oid' => $orderId,
                ':pid' => intval($item['id']),
                ':qty' => intval($item['quantity']),
                ':price' => floatval($item['price']),
                ':var' => json_encode($item['variants'] ?? [])
            ]);
            
            // Update stock
            updateStock($db, $item['id'], $item['quantity']);
        }
        
        // Create tracking entry
        createTracking($db, $orderId, 'Pesanan diterima', 'Pesanan Anda telah diterima dan sedang diproses');
        
        $db->commit();
        
        jsonResponse([
            'success' => true,
            'order_id' => $orderId,
            'order_number' => $orderNumber
        ]);
        
    } catch (Exception $e) {
        $db->rollBack();
        jsonResponse(['error' => $e->getMessage()], 500);
    }
}

function updateStock($db, $productId, $quantity) {
    $sql = "UPDATE products SET stock = stock - :qty, sold_count = sold_count + :qty WHERE id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute([':qty' => $quantity, ':id' => $productId]);
    
    // Check if stock is low
    $sql = "SELECT stock FROM products WHERE id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute([':id' => $productId]);
    $stock = $stmt->fetchColumn();
    
    if ($stock <= 5) {
        // Notify vendor/admin
        notifyLowStock($db, $productId, $stock);
    }
}

function notifyLowStock($db, $productId, $stock) {
    // Implementation for notification
    error_log("Low stock alert: Product $productId has only $stock items left");
}

function createTracking($db, $orderId, $status, $description) {
    $sql = "INSERT INTO order_tracking (order_id, status, description, created_at) 
            VALUES (:oid, :status, :desc, NOW())";
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':oid' => $orderId,
        ':status' => $status,
        ':desc' => $description
    ]);
}

function getOrder($db, $orderId) {
    $sql = "SELECT o.*, u.name as user_name, u.email 
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = :id";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([':id' => $orderId]);
    $order = $stmt->fetch();
    
    if (!$order) {
        jsonResponse(['error' => 'Order not found'], 404);
    }
    
    // Get items
    $sql = "SELECT oi.*, p.name, p.image 
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = :oid";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([':oid' => $orderId]);
    $order['items'] = $stmt->fetchAll();
    
    // Get tracking
    $order['tracking'] = getTrackingHistory($db, $orderId);
    
    jsonResponse($order);
}

function listOrders($db, $userId) {
    $sql = "SELECT o.*, 
            (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
            FROM orders o
            WHERE o.user_id = :uid
            ORDER BY o.created_at DESC";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([':uid' => $userId]);
    $orders = $stmt->fetchAll();
    
    jsonResponse(['orders' => $orders]);
}

function updateOrderStatus($db, $data) {
    $orderId = intval($data['order_id']);
    $status = sanitize($data['status']);
    
    $sql = "UPDATE orders SET status = :status, updated_at = NOW() WHERE id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute([':status' => $status, ':id' => $orderId]);
    
    // Add tracking entry
    $descriptions = [
        'paid' => 'Pembayaran diterima',
        'processing' => 'Pesanan sedang diproses',
        'shipped' => 'Pesanan dikirim',
        'delivered' => 'Pesanan diterima',
        'cancelled' => 'Pesanan dibatalkan'
    ];
    
    createTracking($db, $orderId, $descriptions[$status] ?? $status, 'Status pesanan diperbarui');
    
    jsonResponse(['success' => true]);
}

function trackOrder($db, $orderNumber) {
    $sql = "SELECT id FROM orders WHERE order_number = :num";
    $stmt = $db->prepare($sql);
    $stmt->execute([':num' => sanitize($orderNumber)]);
    $orderId = $stmt->fetchColumn();
    
    if (!$orderId) {
        jsonResponse(['error' => 'Order not found'], 404);
    }
    
    $tracking = getTrackingHistory($db, $orderId);
    
    jsonResponse([
        'order_number' => $orderNumber,
        'tracking' => $tracking
    ]);
}

function getTrackingHistory($db, $orderId) {
    $sql = "SELECT * FROM order_tracking 
            WHERE order_id = :oid 
            ORDER BY created_at ASC";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([':oid' => $orderId]);
    return $stmt->fetchAll();
}

function generateOrderNumber() {
    return 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
}
?>