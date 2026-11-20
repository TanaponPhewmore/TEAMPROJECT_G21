<?php
// POST เพิ่ม Item พร้อมรายชื่อฟิลด์ (ส่งเป็นฟอร์มหรือ JSON ก็ได้) และรหัสข้อผิดพลาด (400, 404, 405)

// api/items.php
//   POST -> add ONE item to the portfolio with that portfolioId
//   Accepts form fields (FormData) or a JSON item (used by Import).
require 'storage.php';
require 'validate.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    sendJson(['error' => 'Method not allowed.'], 405);
}

$input = readInput();

// 1. check the input BEFORE touching the file
$portfolioId = cleanText($input['portfolioId'] ?? '');
[$item, $errors] = validateItem($input);
if ($portfolioId === '') {
    array_unshift($errors, 'Please select a portfolio.');
}
if (count($errors) > 0) {
    sendJson(['error' => $errors[0], 'errors' => $errors], 400);
}

// 2. find the portfolio, add ONE item, write the file
$portfolios = readPortfolios();
foreach ($portfolios as $i => $portfolio) {
    if (($portfolio['id'] ?? '') === $portfolioId) {
        $items = $portfolio['items'] ?? [];
        // the server makes the id (an id sent by the browser is ignored)
        $newItem = ['id' => nextId('item', $items)] + $item;
        $portfolios[$i]['items'][] = $newItem;
        writePortfolios($portfolios);
        sendJson($newItem, 201);
    }
}

sendJson(['error' => 'Portfolio not found.'], 404);