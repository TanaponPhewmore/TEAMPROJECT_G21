<?php
// วิธีรันบนเครื่อง: php -S localhost:8000, เปิดที่ http://localhost:8000, ใช้ Live Server ไม่ได้, ข้อมูลอยู่ที่ local-data/portfolios.json

// api/storage.php
// The ONLY file that opens the data file. Other API files load it with: require 'storage.php';

// Do not show PHP errors to visitors (they can leak file paths). Errors still go to the server log.
ini_set('display_errors', '0');

// If someone opens this file directly in the browser, pretend it does not exist.
if (basename($_SERVER['SCRIPT_FILENAME']) === 'storage.php') {
    http_response_code(404);
    exit;
}

// Laptop (php -S) -> local-data/  (ignored by git)
// EC2 (Apache)    -> /var/www/data (outside the public folder /var/www/html)
if (php_sapi_name() === 'cli-server') {
    define('DATA_DIR', __DIR__ . '/../local-data');
} else {
    define('DATA_DIR', '/var/www/data');
}
define('DATA_FILE', DATA_DIR . '/portfolios.json');
define('LOCK_FILE', DATA_DIR . '/portfolios.lock');

// Send a JSON answer and stop.
function sendJson($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Make sure the data folder exists and can be written.
function ensureDataDir() {
    if (!is_dir(DATA_DIR)) {
        @mkdir(DATA_DIR, 0750, true);
    }
    if (!is_dir(DATA_DIR) || !is_writable(DATA_DIR)) {
        error_log('Data folder is missing or not writable: ' . DATA_DIR);
        sendJson(['error' => 'Server could not open the data folder.'], 500);
    }
}

// One request at a time: wait for our turn. The lock is released when the script ends.
function lockData() {
    static $handle = null;
    if ($handle !== null) {
        return;
    }
    ensureDataDir();
    $handle = fopen(LOCK_FILE, 'c');
    if ($handle === false || !flock($handle, LOCK_EX)) {
        sendJson(['error' => 'Server is busy. Please try again.'], 503);
    }
}

// Read every portfolio from the file (a list of portfolios).
function readPortfolios() {
    lockData();
    if (!file_exists(DATA_FILE)) {
        return [];
    }
    $text = trim(file_get_contents(DATA_FILE));
    if ($text === '') {
        return [];
    }
    $data = json_decode($text, true);
    if (!is_array($data)) {
        // never overwrite a damaged file by accident
        error_log('Data file is not valid JSON: ' . DATA_FILE);
        sendJson(['error' => 'Stored data is damaged.'], 500);
    }
    return $data;
}

// Write the whole list: write a temp file first, then rename it, so the file is never half-written.
function writePortfolios($portfolios) {
    lockData();
    $json = json_encode(array_values($portfolios), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $temp = DATA_FILE . '.tmp';
    if ($json === false || file_put_contents($temp, $json) === false || !rename($temp, DATA_FILE)) {
        error_log('Could not write ' . DATA_FILE);
        sendJson(['error' => 'Server could not save the data.'], 500);
    }
}

// Make the next id like portfolio003 / item003 from the biggest existing one.
function nextId($prefix, $list) {
    $max = 0;
    foreach ($list as $entry) {
        $id = $entry['id'] ?? '';
        if (strpos($id, $prefix) === 0) {
            $number = (int) substr($id, strlen($prefix));
            if ($number > $max) {
                $max = $number;
            }
        }
    }
    return $prefix . str_pad((string) ($max + 1), 3, '0', STR_PAD_LEFT);
}

// Read the request: form fields ($_POST) or a JSON body (used when importing an item).
function readInput() {
    $type = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($type, 'application/json') !== false) {
        $body = file_get_contents('php://input', false, null, 0, 65537);
        if (strlen($body) > 65536) {
            sendJson(['error' => 'Request is too large.'], 413);
        }
        $data = json_decode($body, true);
        if (!is_array($data)) {
            sendJson(['error' => 'The request body must be a JSON object.'], 400);
        }
        return $data;
    }
    return $_POST;
}