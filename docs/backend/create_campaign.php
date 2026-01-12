<?php
/**
 * VibeCheck Campaign API Endpoint
 * 
 * This file handles campaign creation for the VibeCheck platform.
 * Deploy to: https://vibecheck-api.atwebpages.com/api.php
 * 
 * Add this action handler to your existing api.php file.
 */

// ============================================
// ADD THIS TO YOUR EXISTING api.php FILE
// ============================================

/*
// Add this case to your switch statement for ?action= handling:

case 'create_campaign':
    handleCreateCampaign($conn);
    break;

case 'get_campaigns':
    handleGetCampaigns($conn);
    break;

case 'get_campaign_metrics':
    handleGetCampaignMetrics($conn);
    break;
*/

// ============================================
// FUNCTION DEFINITIONS - Add these to api.php
// ============================================

/**
 * Create a new campaign (Drop or Mission)
 * POST /api.php?action=create_campaign
 * 
 * Expected JSON body:
 * {
 *   "partner_id": 1,
 *   "title": "Happy Hour Special",
 *   "description": "...",
 *   "type": "drop" | "mission",
 *   "latitude": 51.5074,
 *   "longitude": -0.1278,
 *   "start_date": "2026-01-08",
 *   "end_date": "2026-01-15",
 *   "reward_points": 500,        // optional, for missions
 *   "mission_action": "review",  // optional, for missions
 *   "image_url": "https://..."   // optional
 * }
 */
function handleCreateCampaign($conn) {
    // Get JSON input
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Validate required fields
    $required = ['partner_id', 'title', 'type', 'latitude', 'longitude'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            echo json_encode([
                'status' => 'error',
                'message' => "Missing required field: $field"
            ]);
            return;
        }
    }
    
    // Sanitize and prepare data
    $partner_id = intval($data['partner_id']);
    $title = $conn->real_escape_string($data['title']);
    $description = $conn->real_escape_string($data['description'] ?? '');
    $type = $conn->real_escape_string($data['type']);
    $latitude = floatval($data['latitude']);
    $longitude = floatval($data['longitude']);
    $start_date = $conn->real_escape_string($data['start_date'] ?? date('Y-m-d'));
    $end_date = $conn->real_escape_string($data['end_date'] ?? date('Y-m-d', strtotime('+7 days')));
    $reward_points = isset($data['reward_points']) ? intval($data['reward_points']) : null;
    $mission_action = isset($data['mission_action']) ? $conn->real_escape_string($data['mission_action']) : null;
    $image_url = isset($data['image_url']) ? $conn->real_escape_string($data['image_url']) : null;
    $status = 'live';
    $created_at = date('Y-m-d H:i:s');
    
    // Validate type
    if (!in_array($type, ['drop', 'mission'])) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid campaign type. Must be "drop" or "mission".'
        ]);
        return;
    }
    
    // Build INSERT query
    $sql = "INSERT INTO campaigns (
        partner_id, title, description, type, latitude, longitude, 
        start_date, end_date, reward_points, mission_action, image_url, status, created_at
    ) VALUES (
        $partner_id, '$title', '$description', '$type', $latitude, $longitude,
        '$start_date', '$end_date', " . ($reward_points !== null ? $reward_points : 'NULL') . ", 
        " . ($mission_action !== null ? "'$mission_action'" : 'NULL') . ",
        " . ($image_url !== null ? "'$image_url'" : 'NULL') . ",
        '$status', '$created_at'
    )";
    
    if ($conn->query($sql) === TRUE) {
        $campaign_id = $conn->insert_id;
        
        // Create corresponding metrics row with initial values
        $metrics_sql = "INSERT INTO campaign_metrics (campaign_id, revenue, scans, views, created_at) 
                        VALUES ($campaign_id, 0.00, 0, 0, '$created_at')";
        $conn->query($metrics_sql);
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Campaign created successfully',
            'campaign_id' => $campaign_id
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Database error: ' . $conn->error
        ]);
    }
}

/**
 * Get all campaigns for a partner
 * GET /api.php?action=get_campaigns&partner_id=1
 */
function handleGetCampaigns($conn) {
    $partner_id = isset($_GET['partner_id']) ? intval($_GET['partner_id']) : 0;
    
    if ($partner_id === 0) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing partner_id parameter'
        ]);
        return;
    }
    
    $sql = "SELECT c.*, m.revenue, m.scans, m.views 
            FROM campaigns c 
            LEFT JOIN campaign_metrics m ON c.id = m.campaign_id 
            WHERE c.partner_id = $partner_id 
            ORDER BY c.created_at DESC";
    
    $result = $conn->query($sql);
    
    if ($result) {
        $campaigns = [];
        while ($row = $result->fetch_assoc()) {
            $campaigns[] = $row;
        }
        echo json_encode([
            'status' => 'success',
            'campaigns' => $campaigns
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Database error: ' . $conn->error
        ]);
    }
}

/**
 * Get metrics for a specific campaign
 * GET /api.php?action=get_campaign_metrics&campaign_id=1
 */
function handleGetCampaignMetrics($conn) {
    $campaign_id = isset($_GET['campaign_id']) ? intval($_GET['campaign_id']) : 0;
    
    if ($campaign_id === 0) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing campaign_id parameter'
        ]);
        return;
    }
    
    $sql = "SELECT * FROM campaign_metrics WHERE campaign_id = $campaign_id";
    $result = $conn->query($sql);
    
    if ($result && $result->num_rows > 0) {
        $metrics = $result->fetch_assoc();
        echo json_encode([
            'status' => 'success',
            'metrics' => $metrics
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Metrics not found for campaign'
        ]);
    }
}

// ============================================
// MySQL TABLE SCHEMAS - Run these CREATE statements
// ============================================

/*
CREATE TABLE IF NOT EXISTS campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partner_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('drop', 'mission') NOT NULL DEFAULT 'drop',
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reward_points INT NULL,
    mission_action VARCHAR(100) NULL,
    image_url VARCHAR(500) NULL,
    status ENUM('live', 'scheduled', 'ended', 'draft') NOT NULL DEFAULT 'live',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_partner (partner_id),
    INDEX idx_status (status),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS campaign_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    revenue DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    scans INT NOT NULL DEFAULT 0,
    views INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    INDEX idx_campaign (campaign_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
*/
?>
