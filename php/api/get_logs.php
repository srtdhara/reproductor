<?php
require_once '../db_connect.php';

try {
    $stmt = $pdo->query("SELECT * FROM logs_eliminaciones ORDER BY fecha_eliminacion DESC LIMIT 50");
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($logs);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>