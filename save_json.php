<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

error_reporting(E_ERROR | E_PARSE);

$SECRET_KEY = 'GUZMAN_SECURE_KEY_2025';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

if (!isset($_POST['key']) || $_POST['key'] !== $SECRET_KEY) {
    http_response_code(403);
    exit;
}

if (empty($_POST['filename']) || !isset($_POST['content'])) {
    http_response_code(400);
    exit;
}

$filename = basename($_POST['filename']);

if (pathinfo($filename, PATHINFO_EXTENSION) !== 'json') {
    http_response_code(400);
    exit;
}

$data = json_decode($_POST['content'], true);
$count = is_array($data) ? count($data) : 0;

$path = __DIR__ . '/' . $filename;

$bytes = file_put_contents(
    $path,
    json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
);

if ($bytes === false) {
    http_response_code(500);
    exit;
}

header('Content-Type: application/json');
echo json_encode([
    'status'    => 'ok',
    'file'      => $filename,
    'registros' => $count,
    'bytes'     => $bytes,
    'saved_at'  => date('Y-m-d H:i:s')
]);
