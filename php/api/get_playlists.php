<?php
require_once '../db_connect.php';

try {
    $stmt = $pdo->query("SELECT * FROM listas_reproduccion ORDER BY nombre");
    $playlists = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($playlists);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>