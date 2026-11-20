<?php
// GET ดึงทั้งหมด, POST สร้าง 1 อัน พร้อมรายชื่อฟิลด์และรหัสข้อผิดพลาด (400, 405)

// api/portfolios.php
//   GET  -> every portfolio (with its items)
//   POST -> create ONE portfolio
require 'storage.php';
require 'validate.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    sendJson(readPortfolios());
}

if ($method !== 'POST') {
    header('Allow: GET, POST');
    sendJson(['error' => 'Method not allowed.'], 405);
}

// 1. check the input BEFORE touching the file
[$data, $errors] = validatePortfolio(readInput());
if (count($errors) > 0) {
    sendJson(['error' => $errors[0], 'errors' => $errors], 400);
}

// 2. read the file, add ONE portfolio, write the file (the lock is held until the script ends)
$portfolios = readPortfolios();
$portfolio = ['id' => nextId('portfolio', $portfolios)] + $data + ['items' => []];
$portfolios[] = $portfolio;
writePortfolios($portfolios);

sendJson($portfolio, 201);