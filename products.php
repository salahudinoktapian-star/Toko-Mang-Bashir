<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Get single product
            getProductDetail($db, intval($_GET['id']));
        } else {
            // List products
            listProducts($db, $_GET);
        }
        break;
        
    case 'POST':
        // Create product (admin only)
        createProduct($db, getJsonInput());
        break;
        
    case 'PUT':
        // Update product
        updateProduct($db, getJsonInput());
        break;
        
    case 'DELETE':
        // Delete product
        deleteProduct($db, intval($_GET['id']));
        break;
}

function listProducts($db, $params) {
    $page = isset($params['page']) ? intval($params['page']) : 1;
    $limit = isset($params['limit']) ? intval($params['limit']) : 12;
    $offset = ($page - 1) * $limit;
    
    $where = ["p.status = 'active'"];
    $bindings = [];
    
    // Search filter
    if (!empty($params['search'])) {
        $where[] = "(p.name LIKE :search OR p.description LIKE :search)";
        $bindings[':search'] = '%' . $params['search'] . '%';
    }
    
    // Category filter
    if (!empty($params['category'])) {
        $where[] = "p.category_id = :category";
        $bindings[':category'] = intval($params['category']);
    }
    
    // Vendor filter
    if (!empty($params['vendor_id'])) {
        $where[] = "p.vendor_id = :vendor_id";
        $bindings[':vendor_id'] = intval($params['vendor_id']);
    }
    
    // Price range
    if (!empty($params['min_price'])) {
        $where[] = "p.price >= :min_price";
        $bindings[':min_price'] = floatval($params['min_price']);
    }
    if (!empty($params['max_price'])) {
        $where[] = "p.price <= :max_price";
        $bindings[':max_price'] = floatval($params['max_price']);
    }
    
    $whereClause = implode(' AND ', $where);
    
    // Sorting
    $sort = isset($params['sort']) ? $params['sort'] : 'newest';
    $orderBy = match($sort) {
        'price-low' => 'p.price ASC',
        'price-high' => 'p.price DESC',
        'popular' => 'p.sold_count DESC',
        default => 'p.created_at DESC'
    };
    
    // Count total
    $countSql = "SELECT COUNT(*) FROM products p WHERE $whereClause";
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($bindings);
    $total = $countStmt->fetchColumn();
    
    // Get products
    $sql = "SELECT 
                p.*,
                v.name as vendor_name,
                v.logo as vendor_logo,
                COALESCE(AVG(r.rating), 0) as rating,
                COUNT(DISTINCT r.id) as review_count,
                (p.stock <= 10) as is_low_stock
            FROM products p
            LEFT JOIN vendors v ON p.vendor_id = v.id
            LEFT JOIN reviews r ON p.id = r.product_id
            WHERE $whereClause
            GROUP BY p.id
            ORDER BY $orderBy
            LIMIT :limit OFFSET :offset";
    
    $stmt = $db->prepare($sql);
    
    foreach ($bindings as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    
    $stmt->execute();
    $products = $stmt->fetchAll();
    
    // Format products
    foreach ($products as &$product) {
        $product['price'] = floatval($product['price']);
        $product['rating'] = round(floatval($product['rating']), 1);
        $product['image'] = getProductImage($product['id']);
        $product['isNew'] = strtotime($product['created_at']) > strtotime('-7 days');
    }
    
    jsonResponse([
        'products' => $products,
        'total' => intval($total),
        'page' => $page,
        'total_pages' => ceil($total / $limit)
    ]);
}

function getProductDetail($db, $id) {
    $sql = "SELECT 
                p.*,
                v.name as vendor_name,
                v.id as vendor_id,
                COALESCE(AVG(r.rating), 0) as rating,
                COUNT(DISTINCT r.id) as review_count
            FROM products p
            LEFT JOIN vendors v ON p.vendor_id = v.id
            LEFT JOIN reviews r ON p.id = r.product_id
            WHERE p.id = :id AND p.status = 'active'
            GROUP BY p.id";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([':id' => $id]);
    $product = $stmt->fetch();
    
    if (!$product) {
        jsonResponse(['error' => 'Product not found'], 404);
    }
    
    // Get additional images
    $product['images'] = getProductImages($id);
    
    // Get variants
    $product['variants'] = getProductVariants($db, $id);
    
    // Get related products
    $product['related'] = getRelatedProducts($db, $id, $product['category_id']);
    
    jsonResponse($product);
}

function getProductImage($productId) {
    // Return default or actual image path
    return "https://via.placeholder.com/400x400/6366f1/ffffff?text=Product+$productId";
}

function getProductImages($productId) {
    return [
        "https://via.placeholder.com/400x400/6366f1/ffffff?text=Product+$productId",
        "https://via.placeholder.com/400x400/ec4899/ffffff?text=View+2",
        "https://via.placeholder.com/400x400/10b981/ffffff?text=View+3"
    ];
}

function getProductVariants($db, $productId) {
    $sql = "SELECT type, value FROM product_variants WHERE product_id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute([':id' => $productId]);
    $variants = $stmt->fetchAll();
    
    $result = [];
    foreach ($variants as $variant) {
        if (!isset($result[$variant['type']])) {
            $result[$variant['type']] = [];
        }
        $result[$variant['type']][] = $variant['value'];
    }
    
    return $result;
}

function getRelatedProducts($db, $productId, $categoryId) {
    $sql = "SELECT id, name, price, image 
            FROM products 
            WHERE category_id = :category AND id != :id AND status = 'active'
            LIMIT 4";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([':category' => $categoryId, ':id' => $productId]);
    
    return $stmt->fetchAll();
}

function createProduct($db, $data) {
    // Admin authorization check required
    
    $sql = "INSERT INTO products (name, description, price, stock, category_id, vendor_id, status) 
            VALUES (:name, :desc, :price, :stock, :cat, :vendor, 'active')";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':name' => sanitize($data['name']),
        ':desc' => sanitize($data['description']),
        ':price' => floatval($data['price']),
        ':stock' => intval($data['stock']),
        ':cat' => intval($data['category_id']),
        ':vendor' => intval($data['vendor_id'])
    ]);
    
    $productId = $db->lastInsertId();
    
    // Handle inventory sync
    syncInventory($db, $productId, intval($data['stock']));
    
    jsonResponse(['success' => true, 'product_id' => $productId], 201);
}

function updateProduct($db, $data) {
    $sql = "UPDATE products SET 
                name = :name,
                price = :price,
                stock = :stock,
                updated_at = NOW()
            WHERE id = :id";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':name' => sanitize($data['name']),
        ':price' => floatval($data['price']),
        ':stock' => intval($data['stock']),
        ':id' => intval($data['id'])
    ]);
    
    jsonResponse(['success' => true]);
}

function deleteProduct($db, $id) {
    // Soft delete
    $sql = "UPDATE products SET status = 'deleted' WHERE id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute([':id' => $id]);
    
    jsonResponse(['success' => true]);
}

function syncInventory($db, $productId, $stock) {
    // Update inventory tracking
    $sql = "INSERT INTO inventory_logs (product_id, quantity, type, created_at) 
            VALUES (:pid, :qty, 'initial', NOW())";
    $stmt = $db->prepare($sql);
    $stmt->execute([':pid' => $productId, ':qty' => $stock]);
}

function getJsonInput() {
    return json_decode(file_get_contents('php://input'), true);
}
?>