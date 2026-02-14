<?php
require_once 'config.php';

$db = getDB();
$method = $_GET['method'] ?? '';
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'transfer':
        createVirtualAccount($db, $input);
        break;
    case 'creditcard_token':
        createCreditCardToken($input);
        break;
    case 'ewallet':
        createEWalletPayment($input);
        break;
    case 'cod_confirm':
        confirmCOD($db, $input);
        break;
    case 'status':
        checkPaymentStatus($db, $_GET['order_id']);
        break;
    case 'notification':
        handlePaymentNotification($db, $input);
        break;
    default:
        jsonResponse(['error' => 'Invalid method'], 400);
}

function createVirtualAccount($db, $data) {
    $orderId = sanitize($data['order_id']);
    $amount = floatval($data['amount']);
    $bank = sanitize($data['bank']);
    
    // Integration with Midtrans/Xendit
    $vaNumber = generateVirtualAccount($bank, $orderId);
    $expiry = date('Y-m-d H:i:s', strtotime('+24 hours'));
    
    // Save to database
    $sql = "INSERT INTO payments (
                order_id, method, amount, status, 
                va_number, bank, expiry_date, created_at
            ) VALUES (
                :oid, 'bank_transfer', :amount, 'pending',
                :va, :bank, :expiry, NOW()
            )";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':oid' => $orderId,
        ':amount' => $amount,
        ':va' => $vaNumber,
        ':bank' => $bank,
        ':expiry' => $expiry
    ]);
    
    jsonResponse([
        'success' => true,
        'va_number' => $vaNumber,
        'bank' => $bank,
        'amount' => $amount,
        'expiry' => $expiry
    ]);
}

function generateVirtualAccount($bank, $orderId) {
    $prefixes = [
        'bca' => '888',
        'bni' => '009',
        'bri' => '002',
        'mandiri' => '008'
    ];
    
    $prefix = $prefixes[$bank] ?? '999';
    $random = str_pad(mt_rand(1, 9999999999), 10, '0', STR_PAD_LEFT);
    
    return $prefix . $random;
}

function createCreditCardToken($data) {
    // Integration with Midtrans
    $orderId = $data['order_id'];
    $amount = $data['amount'];
    
    // Get token from payment provider
    $token = requestMidtransToken([
        'transaction_details' => [
            'order_id' => $orderId,
            'gross_amount' => $amount
        ],
        'credit_card' => [
            'secure' => true
        ]
    ]);
    
    jsonResponse([
        'token' => $token,
        'redirect_url' => "https://app.midtrans.com/snap/v2/vtweb/$token"
    ]);
}

function requestMidtransToken($params) {
    // Actual API call to Midtrans
    // Return dummy token for demo
    return 'dummy-token-' . uniqid();
}

function createEWalletPayment($data) {
    $walletType = $data['wallet_type'];
    $orderId = $data['order_id'];
    $amount = $data['amount'];
    
    switch ($walletType) {
        case 'gopay':
            $response = [
                'deeplink' => "gojek://gopay/merchanttransfer?amount=$amount",
                'qr_code' => generateQRCode($orderId, $amount)
            ];
            break;
        case 'ovo':
            $response = ['deeplink' => "ovo://payment?amount=$amount"];
            break;
        default:
            $response = ['error' => 'Unsupported wallet'];
    }
    
    jsonResponse($response);
}

function generateQRCode($orderId, $amount) {
    return "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ORDER:$orderId:AMOUNT:$amount";
}

function confirmCOD($db, $data) {
    $orderId = $data['order_id'];
    
    $sql = "INSERT INTO payments (order_id, method, amount, status, created_at) 
            VALUES (:oid, 'cod', 0, 'pending', NOW())";
    $stmt = $db->prepare($sql);
    $stmt->execute([':oid' => $orderId]);
    
    jsonResponse(['success' => true]);
}

function checkPaymentStatus($db, $orderId) {
    $sql = "SELECT status FROM payments WHERE order_id = :oid ORDER BY created_at DESC LIMIT 1";
    $stmt = $db->prepare($sql);
    $stmt->execute([':oid' => $orderId]);
    $status = $stmt->fetchColumn();
    
    jsonResponse(['status' => $status ?: 'pending']);
}

function handlePaymentNotification($db, $data) {
    // Webhook from payment provider
    $orderId = $data['order_id'];
    $status = $data['transaction_status'];
    $type = $data['payment_type'];
    
    // Update payment record
    $sql = "UPDATE payments SET 
                status = :status,
                transaction_id = :trans_id,
                settlement_time = :settlement,
                updated_at = NOW()
            WHERE order_id = :oid";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':status' => $status,
        ':trans_id' => $data['transaction_id'] ?? null,
        ':settlement' => $data['settlement_time'] ?? null,
        ':oid' => $orderId
    ]);
    
    // Update order status if paid
    if (in_array($status, ['capture', 'settlement'])) {
        $sql = "UPDATE orders SET status = 'paid' WHERE id = :oid";
        $stmt = $db->prepare($sql);
        $stmt->execute([':oid' => $orderId]);
        
        // Add tracking
        $sql = "INSERT INTO order_tracking (order_id, status, description, created_at) 
                VALUES (:oid, 'Pembayaran diterima', 'Pembayaran telah dikonfirmasi', NOW())";
        $stmt = $db->prepare($sql);
        $stmt->execute([':oid' => $orderId]);
    }
    
    jsonResponse(['success' => true]);
}
?>