<?php
// php/db_connect.php
header('Content-Type: application/json');

$host = 'localhost';
$port = '5432';
$dbname = 'sistema_musical';
$user = 'postgres'; // Reemplaza con tu usuario de PostgreSQL
$password = '123456'; // Reemplaza con tu contraseña

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
    $pdo = new PDO($dsn, $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Connection failed: ' . $e->getMessage()]);
    exit();
}
?>