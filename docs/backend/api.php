<?php
/**
 * api.php - VibeCheck Omni-Backend v25.15 (dev copy)
 * Updated: session support + merged influencer dashboard
 */

// 1. Enable Error Reporting for Debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// 2. CORS & Headers
// More robust CORS handling
$allowed_origins = [
    'http://localhost:5173',
    'https://scout-and-clout.lovable.app'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
}

// Handle pre-flight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // If the origin is allowed, send a 200 OK
    if (in_array($origin, $allowed_origins)) {
        http_response_code(200);
    } else {
        // Otherwise, forbid the request
        http_response_code(403);
    }
    exit();
}

// Set content type to JSON by default for API responses, but specific handlers can override
header('Content-Type: application/json');


// Start session so endpoints can use server-side sessions
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 3. Database Connection
$host = "pdb1056.awardspace.net";
$db_name = "4719155_vibecheck";
$username = "4719155_vibecheck";
$password = "Abigail@33";

try {
    $dsn = "mysql:host=$host;dbname=$db_name;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    $conn = new PDO($dsn, $username, $password, $options);

    // Ensure required tables exist (non-destructive)
    $conn->exec("CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, username VARCHAR(100), business_name VARCHAR(255), profile_pic TEXT, cover_url TEXT, role VARCHAR(50) DEFAULT 'influencer', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
    $conn->exec("CREATE TABLE IF NOT EXISTS user_roles (user_id INT, role VARCHAR(50), PRIMARY KEY (user_id, role))");
    $conn->exec("CREATE TABLE IF NOT EXISTS scans (id INT AUTO_INCREMENT PRIMARY KEY, partner_id INT, influencer_id INT, source VARCHAR(50), revenue INT, traffic INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
    $conn->exec("CREATE TABLE IF NOT EXISTS gig_rewards (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, gig_name VARCHAR(255), status VARCHAR(50), reward INT, date DATE)");
    $conn->exec("CREATE TABLE IF NOT EXISTS earnings (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, amount DECIMAL(10,2), source_desc VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
    $conn->exec("CREATE TABLE IF NOT EXISTS campaigns (id INT AUTO_INCREMENT PRIMARY KEY, partner_id INT, title VARCHAR(255), description TEXT, type ENUM('drop', 'mission') DEFAULT 'drop', status ENUM('active', 'scheduled', 'ended') DEFAULT 'active', reward_text VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");

} catch(PDOException $e) {
    http_response_code(500);
    die(json_encode([
        "status" => "error",
        "message" => "Database Connection Failed: " . $e->getMessage()
    ]));
}

// 4. Router
$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true);

switch($action) {
    case 'login': handleLogin($conn, $data); break;
    case 'add_role': handleAddRole($conn, $data); break;
    case 'register': handleRegister($conn, $data); break;
    case 'get_partner_dashboard': handlePartnerDashboard($conn); break;
    case 'get_influencer_dashboard': handleInfluencerDashboard($conn); break;
    case 'seed_analytics': seedAnalytics($conn); break;
    case 'upload_media': handleUploadMedia($conn); break;
    case 'delete_campaign': handleDeleteCampaign($conn, $data); break;
    case 'update_user': handleUpdateUser($conn, $data); break;
    case 'get_campaigns': handleGetCampaigns($conn); break;
    case 'create_campaign': handleCreateCampaign($conn, $data); break;
    case 'manual_add_scan': handleManualScan($conn, $data); break;
    default: echo json_encode(["message" => "VibeCheck Omni-API v25.15 Online"]); break;
}

// =============================================================
// AUTHENTICATION & PROFILE
// =============================================================

function handleLogin($conn, $data) {
    if (empty($data['email']) || empty($data['password'])) {
        die(json_encode(["status" => "error", "message" => "Missing credentials"]));
    }
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && (password_verify($data['password'], $user['password_hash']) || $user['password_hash'] === 'demo')) {
        unset($user['password_hash']);
        
        // Also fetch partner-specific columns if they exist
        $roleStmt = $conn->prepare("SELECT role FROM user_roles WHERE user_id = ?");
        $roleStmt->execute([$user['id']]);
        $user['roles'] = $roleStmt->fetchAll(PDO::FETCH_COLUMN);

        // store session user id
        if (session_status() === PHP_SESSION_NONE) session_start();
        $_SESSION['user_id'] = (int)$user['id'];

        echo json_encode(["status" => "success", "user" => $user]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid credentials"]);
    }
}

function handleUpdateUser($conn, $data) {
    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) {
        die(json_encode(["status" => "error", "message" => "Missing or invalid user id"]));
    }
    // Determine context: 'partner' (merchant) vs 'personal' (influencer)
    $context = $data['context'] ?? 'personal';

    // Ensure partner-specific columns exist when updating partner context
    if ($context === 'partner') {
        try {
            $colCheck = $conn->prepare("SHOW COLUMNS FROM users LIKE ?");
            $colCheck->execute(['partner_profile_pic']);
            if (!$colCheck->fetch()) {
                $conn->exec("ALTER TABLE users ADD COLUMN partner_profile_pic TEXT NULL");
            }
            $colCheck->execute(['partner_cover_url']);
            if (!$colCheck->fetch()) {
                $conn->exec("ALTER TABLE users ADD COLUMN partner_cover_url TEXT NULL");
            }
        } catch (Exception $e) {
            // If ALTER fails (permissions), continue — updates may still use existing columns
        }
    }

    // Build allowed list depending on context and map incoming keys if needed
    $updates = [];
    $values = [];

    // Password handling (always allowed)
    if (!empty($data['password'])) {
        $updates[] = "password_hash = ?";
        $values[] = password_hash($data['password'], PASSWORD_DEFAULT);
    }

    if ($context === 'partner') {
        // Accept partner-specific updates. Also accept frontend keys 'profile_pic'/'cover_url' and map them.
        $mapping = [
            'partner_profile_pic' => 'partner_profile_pic',
            'partner_cover_url' => 'partner_cover_url',
            'profile_pic' => 'partner_profile_pic',
            'cover_url' => 'partner_cover_url',
            'business_name' => 'business_name',
            'email' => 'email',
        ];
    } else {
        $mapping = [
            'username' => 'username',
            'business_name' => 'business_name',
            'profile_pic' => 'profile_pic',
            'cover_url' => 'cover_url',
            'email' => 'email',
        ];
    }

    foreach ($mapping as $incoming => $col) {
        if (array_key_exists($incoming, $data)) {
            $updates[] = "$col = ?";
            $values[] = $data[$incoming];
        }
    }

    if (empty($updates)) {
        die(json_encode(["status" => "error", "message" => "No valid fields to update"]));
    }

    $values[] = $id;
    $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
    try {
        $conn->prepare($sql)->execute($values);
        echo json_encode(["status" => "success", "message" => "Profile Updated"]);
    } catch(Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}

// =============================================================
// CAMPAIGNS / DROPS
// =============================================================

function handleGetCampaigns($conn) {
    $pid = (int)($_GET['partner_id'] ?? 0);
    $stmt = $conn->prepare("SELECT * FROM campaigns WHERE partner_id = ? AND status = 'active' ORDER BY created_at DESC");
    $stmt->execute([$pid]);
    echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
}

function handleCreateCampaign($conn, $data) {
    try {
        // Ensure campaigns table has a column for media_url so uploaded media can be persisted
        try {
            $colCheck = $conn->prepare("SHOW COLUMNS FROM campaigns LIKE ?");
            $colCheck->execute(['media_url']);
            if (!$colCheck->fetch()) {
                $conn->exec("ALTER TABLE campaigns ADD COLUMN media_url TEXT NULL");
            }
        } catch (Exception $e) {
            // ignore - some hosts may not allow ALTER TABLE
        }

        $stmt = $conn->prepare("INSERT INTO campaigns (partner_id, title, description, type, status, reward_text, media_url) VALUES (?, ?, ?, ?, 'active', ?, ?)");
        $stmt->execute([$pid = $data['partner_id'], $data['title'], $data['description'], $data['type'] ?? 'drop', $data['reward_text'] ?? null, $data['media_url'] ?? null]);
        echo json_encode(["status" => "success", "id" => $conn->lastInsertId()]);
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}

function handleDeleteCampaign($conn, $data) {
    // Support both JSON body and GET param
    $id = 0;
    if (!empty($data['id'])) {
        $id = (int)$data['id'];
    } else if (!empty($_GET['id'])) {
        $id = (int)$_GET['id'];
    }

    if ($id <= 0) {
        echo json_encode(["status" => "error", "message" => "Missing or invalid campaign id"]);
        return;
    }

    try {
        $stmt = $conn->prepare("DELETE FROM campaigns WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() > 0) {
            echo json_encode(["status" => "success", "deleted" => true]);
        } else {
            echo json_encode(["status" => "error", "message" => "Campaign not found or already deleted"]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}

function handleUploadMedia($conn) {
    // Prefer public webroot 'uploads' (so files are directly accessible via https://<host>/uploads/)
    $publicRoot = rtrim($_SERVER['DOCUMENT_ROOT'] ?? '', '/\\');
    $publicUploads = $publicRoot ? $publicRoot . DIRECTORY_SEPARATOR . 'uploads' : '';

    if ($publicUploads && is_dir(dirname($publicRoot))) {
        $uploadDir = $publicUploads;
    } else {
        // fallback to script directory uploads
        $uploadDir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads';
    }

    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0775, true);
    }

    // Ensure a file was uploaded via 'file' form key
    if (empty($_FILES) || !isset($_FILES['file'])) {
        echo json_encode(["status" => "error", "message" => "No file uploaded (expected form field 'file')"]);
        return;
    }

    $file = $_FILES['file'];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(["status" => "error", "message" => "Upload error code: " . $file['error']]);
        return;
    }

    // Desired maximum file size (30 MB)
    $desiredMaxBytes = 30 * 1024 * 1024; // 30MB

    // Helper: convert php.ini size string (e.g. '8M') to bytes
    $phpSizeToBytes = function($val) {
        $val = trim($val);
        if ($val === '' || $val === '0') return 0;
        $unit = strtolower(substr($val, -1));
        $num = (float)$val;
        if ($unit === 'g') return (int)($num * 1024 * 1024 * 1024);
        if ($unit === 'm') return (int)($num * 1024 * 1024);
        if ($unit === 'k') return (int)($num * 1024);
        return (int)$num;
    };

    $serverUploadMax = $phpSizeToBytes(ini_get('upload_max_filesize') ?: '0');
    $serverPostMax = $phpSizeToBytes(ini_get('post_max_size') ?: '0');
    $serverAllow = 0;
    if ($serverUploadMax > 0 && $serverPostMax > 0) {
        $serverAllow = min($serverUploadMax, $serverPostMax);
    } else {
        $serverAllow = max($serverUploadMax, $serverPostMax);
    }

    // If server-side PHP limits are lower than desired, return a helpful error
    if ($serverAllow > 0 && $serverAllow < $desiredMaxBytes) {
        echo json_encode(["status" => "error", "message" => "Server PHP limits too low: upload_max_filesize=" . (ini_get('upload_max_filesize') ?: 'unknown') . ", post_max_size=" . (ini_get('post_max_size') ?: 'unknown') . ". Increase them to at least 30M."]);
        return;
    }

    // Enforce desired maximum on the uploaded file
    if ($file['size'] > $desiredMaxBytes) {
        echo json_encode(["status" => "error", "message" => "File too large (max 30MB)"]);
        return;
    }

    // Sanitize and create filename
    $origName = basename($file['name']);
    $ext = pathinfo($origName, PATHINFO_EXTENSION);
    $safeBase = preg_replace('/[^A-Za-z0-9_-]/', '_', pathinfo($origName, PATHINFO_FILENAME));
    $filename = $safeBase . '_' . time() . '_' . bin2hex(random_bytes(6)) . ($ext ? '.' . $ext : '');
    $dest = $uploadDir . DIRECTORY_SEPARATOR . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        echo json_encode(["status" => "error", "message" => "Failed to move uploaded file (check directory permissions)"]);
        return;
    }

    // Ensure file is readable
    @chmod($dest, 0644);

    // Build public URL to the uploaded file relative to this script
    $proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    // Public URL should point to /uploads/<file> on the host
    $url = $proto . $host . '/uploads/' . $filename;

    echo json_encode(["status" => "success", "url" => $url]);
}

// =============================================================
// DASHBOARDS & SEEDING
// =============================================================

function handleInfluencerDashboard($conn) {
    // Prefer session user id, then GET param, then body
    if (session_status() === PHP_SESSION_NONE) session_start();
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $uid = (int)($_SESSION['user_id'] ?? $_GET['user_id'] ?? $body['user_id'] ?? $body['id'] ?? 0);

    if ($uid <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Missing or invalid user_id']);
        return;
    }

    // Calculate total balance (scans.revenue + earnings.amount)
    $stmt = $conn->prepare("
        SELECT (
            (SELECT IFNULL(SUM(revenue), 0) FROM scans WHERE influencer_id = ?) +
            (SELECT IFNULL(SUM(amount), 0) FROM earnings WHERE user_id = ?)
        ) as total_balance
    ");
    $stmt->execute([$uid, $uid]);
    $balance = (float)$stmt->fetchColumn();

    // Aggregate scans by year-month
    $stmt = $conn->prepare("
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym,
               MONTH(created_at) AS m,
               MONTHNAME(created_at) AS month,
               SUM(revenue) AS total
        FROM scans
        WHERE influencer_id = ?
        GROUP BY ym
    ");
    $stmt->execute([$uid]);
    $scansByMonth = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Aggregate earnings by year-month
    $stmt = $conn->prepare("
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym,
               MONTH(created_at) AS m,
               MONTHNAME(created_at) AS month,
               SUM(amount) AS total
        FROM earnings
        WHERE user_id = ?
        GROUP BY ym
    ");
    $stmt->execute([$uid]);
    $earningsByMonth = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Merge both sets by ym (year-month)
    $merged = [];
    foreach (array_merge($scansByMonth, $earningsByMonth) as $r) {
        $ym = $r['ym'];
        $total = (float)$r['total'];
        if (!isset($merged[$ym])) {
            $merged[$ym] = ['ym' => $ym, 'm' => (int)$r['m'], 'month' => $r['month'], 'total' => 0.0];
        }
        $merged[$ym]['total'] += $total;
    }

    // Build last N months (4) in chronological order, fill missing months with total=0
    $monthsCount = 4;
    $months = [];
    for ($i = $monthsCount - 1; $i >= 0; $i--) {
        $dt = new DateTime("first day of -{$i} month");
        $ym = $dt->format('Y-m');
        $monthName = $dt->format('F');
        $months[$ym] = ['month' => $monthName, 'total' => 0.0, 'm' => (int)$dt->format('n')];
    }

    // fill with merged totals if present
    foreach ($merged as $ym => $data) {
        if (isset($months[$ym])) {
            $months[$ym]['total'] = (float)$data['total'];
        }
    }

    $monthly = array_values($months);

    // gig rewards (keep existing behavior)
    $stmt = $conn->prepare("SELECT id, gig_name, status, reward, date FROM gig_rewards WHERE user_id = ? ORDER BY date DESC");
    $stmt->execute([$uid]);
    $gigs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => [
            "available_balance" => $balance,
            "monthly_breakdown" => $monthly,
            "gig_rewards" => $gigs
        ]
    ]);
    // debug: include which user id was used
    return;
}

function handlePartnerDashboard($conn) {
    // Consistent User ID retrieval
    if (session_status() === PHP_SESSION_NONE) session_start();
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $pid = (int)($_SESSION['user_id'] ?? $_GET['user_id'] ?? $body['user_id'] ?? $body['id'] ?? 0);

    if ($pid <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Missing or invalid partner user_id']);
        return;
    }
    
    $stmt = $conn->prepare("SELECT DATE(created_at) as date, SUM(revenue) as rev, COUNT(*) as scans FROM scans WHERE partner_id = ? GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 7");
    $stmt->execute([$pid]);
    $chart = $stmt->fetchAll(PDO::FETCH_ASSOC);
    // If no chart data, return demo data for new users
    if (!$chart || count($chart) === 0) {
        $chart = [
            [
                'date' => date('Y-m-d', strtotime('-4 days')),
                'rev' => 120,
                'scans' => 15
            ],
            [
                'date' => date('Y-m-d', strtotime('-3 days')),
                'rev' => 180,
                'scans' => 22
            ],
            [
                'date' => date('Y-m-d', strtotime('-2 days')),
                'rev' => 90,
                'scans' => 10
            ],
            [
                'date' => date('Y-m-d', strtotime('-1 days')),
                'rev' => 200,
                'scans' => 30
            ],
            [
                'date' => date('Y-m-d'),
                'rev' => 150,
                'scans' => 18
            ]
        ];
    }

    // 1. Get up to 5 real influencers from the database.
    $stmt = $conn->prepare("
        SELECT u.id, u.username as name, u.profile_pic as avatar
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        WHERE ur.role = 'influencer' AND u.id != ?
        ORDER BY u.created_at DESC
        LIMIT 5
    ");
    $stmt->execute([$pid]);
    $influencers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Create a normalized list, assigning fake revenue to each for demo purposes.
    $normalized = [];
    foreach ($influencers as $inf) {
        $normalized[] = [
            'id' => $inf['id'],
            'name' => $inf['name'] ?? 'New Influencer',
            'revenue' => rand(50, 2500) + (rand(0, 99) / 100.0), // Fake revenue
            'sales' => rand(5, 100), // Fake sales
            'avatar' => $inf['avatar'] ?? null,
        ];
    }

    // 3. If there are fewer than 5 real influencers, pad with generic placeholders.
    $realNames = ['Alexina Jordan', 'Ben Carter', 'Chloe Davis', 'Daniel Evans', 'Elara Vance'];
    $realAvatars = [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
    ];
    while (count($normalized) < 5) {
        $i = count($normalized);
        $normalized[] = [
            'id' => -($i + 1),
            'name' => $realNames[$i % count($realNames)],
            'revenue' => rand(50, 2500) + (rand(0, 99) / 100.0),
            'sales' => rand(5, 100),
            'avatar' => $realAvatars[$i % count($realAvatars)],
        ];
    }

    // 4. Sort the final list by the generated revenue in descending order.
    usort($normalized, function($a, $b) {
        return $b['revenue'] <=> $a['revenue'];
    });

    echo json_encode(["status" => "success", "data" => ["chart_data" => $chart, "top_influencers" => $normalized]]);
}

function seedAnalytics($conn) {
    // Prefer session user id, then GET param, then JSON body (to support POST from clients)
    if (session_status() === PHP_SESSION_NONE) session_start();
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $uid = (int)($_SESSION['user_id'] ?? $_GET['user_id'] ?? $body['user_id'] ?? 0);

    if ($uid <= 0) {
        echo json_encode(["status" => "error", "message" => "Missing or invalid user_id for seeding"]);
        return;
    }

    try {
        $conn->beginTransaction();

        // Remove any earnings for the last 4 months to avoid duplicates
        $start = (new DateTime('first day of -3 month'))->format('Y-m-01 00:00:00');
        $conn->prepare("DELETE FROM earnings WHERE user_id = ? AND created_at >= ?")->execute([$uid, $start]);

        // Insert 4 seeded earnings rows (one per month) with random amounts
        $insertStmt = $conn->prepare("INSERT INTO earnings (user_id, amount, source_desc, created_at) VALUES (?, ?, 'Seeded', ?)");
        for ($i = 3; $i >= 0; $i--) {
            $dt = new DateTime("first day of -{$i} month");
            $yearMonth = $dt->format('Y-m');
            $day = rand(1, 28);
            $created_at = sprintf('%s-%02d 12:00:00', $yearMonth, $day);
            $amount = rand(200, 1200) + rand(0,99) / 100.0; // random between 200.00 - 1299.99
            $insertStmt->execute([$uid, number_format($amount, 2, '.', ''), $created_at]);
        }

        // Seed 6 past gig rewards for the user (realistic descriptions + dollar rewards)
        $startG = (new DateTime('first day of -5 month'))->format('Y-m-01');
        $conn->prepare("DELETE FROM gig_rewards WHERE user_id = ? AND date >= ?")->execute([$uid, $startG]);

        $insertG = $conn->prepare("INSERT INTO gig_rewards (user_id, gig_name, status, reward, date) VALUES (?, ?, ?, ?, ?)");
        $sampleGigs = [
            ['Post a pic of our new menu item', 'completed', 20],
            ['Interview our head chef', 'completed', 50],
            ['Share our new menu story', 'completed', 15],
            ['Host a giveaway with a friend', 'completed', 30],
            ['Create a TikTok taste test', 'completed', 25],
            ['Write a review and tag us', 'completed', 10],
        ];

        for ($m = 5; $m >= 0; $m--) {
            $dt = new DateTime("first day of -{$m} month");
            $date = $dt->format('Y-m-d');
            $gig = $sampleGigs[$m % count($sampleGigs)];
            $insertG->execute([$uid, $gig[0], $gig[1], $gig[2], $date]);
        }

        // If this user is a partner/merchant, seed some scans so partner analytics show data
        try {
            $roleCheck = $conn->prepare("SELECT role FROM user_roles WHERE user_id = ?");
            $roleCheck->execute([$uid]);
            $roles = $roleCheck->fetchAll(PDO::FETCH_COLUMN);
            if (in_array('merchant', $roles) || in_array('partner', $roles)) {
                // Remove recent scans for this partner for idempotency (last 30 days)
                $cut = (new DateTime('first day of -1 month'))->format('Y-m-d 00:00:00');
                $conn->prepare("DELETE FROM scans WHERE partner_id = ? AND created_at >= ?")->execute([$uid, $cut]);

                // Create or find a few demo influencer users to attribute scans to
                $influencerIds = [];
                for ($i = 1; $i <= 3; $i++) {
                    $demoEmail = sprintf('demo_influencer_%d_for_partner_%d@example.com', $i, $uid);
                    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
                    $stmt->execute([$demoEmail]);
                    $found = $stmt->fetchColumn();
                    if ($found) {
                        $influencerIds[] = (int)$found;
                    } else {
                        $conn->prepare("INSERT INTO users (email, password_hash, username, role) VALUES (?, 'demo', ?, 'influencer')")->execute([$demoEmail, 'DemoInfluencer'.$i]);
                        $influencerIds[] = (int)$conn->lastInsertId();
                    }
                }

                // Insert sample scans over the last 14 days
                $insertScan = $conn->prepare("INSERT INTO scans (partner_id, influencer_id, source, revenue, created_at) VALUES (?, ?, ?, ?, ?)");
                for ($d = 14; $d >= 0; $d--) {
                    $dt = new DateTime("-{$d} days");
                    $created = $dt->format('Y-m-d H:i:s');
                    // Random number of scans per day
                    $count = rand(1, 5);
                    for ($c = 0; $c < $count; $c++) {
                        $inf = $influencerIds[array_rand($influencerIds)];
                        $revenue = rand(5, 120); // dollars
                        $source = ['qr','link','direct'][array_rand(['qr','link','direct'])];
                        $insertScan->execute([$uid, $inf, $source, $revenue, $created]);
                    }
                }
            }
        } catch (Exception $e) {
            // ignore scan seeding failures
        }

        // After seeding scans, refresh the aggregated revenue table for ALL users
        try {
            // Clear old summary data
            $conn->exec("TRUNCATE TABLE influencer_revenue");

            // Re-populate with fresh data from the scans table
            $conn->exec("
                INSERT INTO influencer_revenue (influencer_id, partner_id, total_revenue, total_sales)
                SELECT 
                    influencer_id,
                    partner_id,
                    SUM(revenue) as total_revenue,
                    COUNT(id) as total_sales
                FROM 
                    scans
                WHERE influencer_id IS NOT NULL AND partner_id IS NOT NULL
                GROUP BY 
                    influencer_id, 
                    partner_id
            ");
        } catch (Exception $e) {
            // If this fails (e.g. table doesn't exist), we can ignore it and the dashboard will fall back gracefully.
        }

        $conn->commit();
        echo json_encode(["status" => "success", "message" => "Earnings and revenue summary seeded for user {$uid}"]);
    } catch(Exception $e) {
        if ($conn->inTransaction()) $conn->rollBack();
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}

function handleRegister($conn, $data) {
    try {
        $check = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $check->execute([$data['email']]);
        if ($check->fetch()) {
            echo json_encode(["status" => "error", "message" => "Email already exists"]);
            return;
        }

        // Ensure partner-specific columns exist before inserting
        try {
            $conn->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_profile_pic TEXT NULL");
            $conn->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_cover_url TEXT NULL");
        } catch (Exception $e) { /* ignore */ }

        $hash = password_hash($data['password'], PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO users (email, password_hash, username, business_name, profile_pic, cover_url, partner_profile_pic, partner_cover_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['email'], 
            $hash, 
            $data['username'] ?? $data['name'] ?? '', 
            $data['business_name'] ?? null,
            $data['profile_pic'] ?? null,
            $data['cover_url'] ?? null,
            $data['partner_profile_pic'] ?? null,
            $data['partner_cover_url'] ?? null
        ]);
        $uid = $conn->lastInsertId();

        // Handle single or multiple roles
        $rolesToInsert = [];
        if (!empty($data['role'])) {
            if (is_array($data['role'])) {
                $rolesToInsert = $data['role'];
            } else {
                $rolesToInsert[] = $data['role'];
            }
        }
        
        // Insert all roles
        $stmtRole = $conn->prepare("INSERT INTO user_roles (user_id, role) VALUES (?, ?)");
        foreach ($rolesToInsert as $role) {
            $stmtRole->execute([$uid, $role]);
        }

        // Auto-login the newly registered user
        if (session_status() === PHP_SESSION_NONE) session_start();
        $_SESSION['user_id'] = (int)$uid;

        echo json_encode(["status" => "success", "user_id" => $uid, "roles" => $rolesToInsert]);
    } catch(Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}

function handleManualScan($conn, $data) {
    $stmt = $conn->prepare("INSERT INTO scans (partner_id, influencer_id, source, revenue) VALUES (?, ?, ?, ?)");
    $stmt->execute([$data['partner_id'], $data['influencer_id'], $data['source'], $data['revenue']]);
    echo json_encode(["status" => "success"]);
}

function handleAddRole($conn, $data) {
    try {
        $stmt = $conn->prepare("INSERT IGNORE INTO user_roles (user_id, role) VALUES (?, ?)");
        $stmt->execute([$data['user_id'], $data['role']]);

        if ($data['role'] === 'merchant' && !empty($data['business_name'])) {
            $conn->prepare("UPDATE users SET business_name = ? WHERE id = ?")->execute([$data['business_name'], $data['user_id']]);
        }

        echo json_encode(["status" => "success", "message" => "Role added"]);
    } catch(Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}

?>