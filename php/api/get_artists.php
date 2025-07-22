<?php
require_once '../db_connect.php';

try {
    $stmt = $pdo->query("SELECT * FROM artistas ORDER BY nombre");
    $artists = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($artists);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>