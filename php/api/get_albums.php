<?php
require_once '../db_connect.php';

try {
    $stmt = $pdo->query("
        SELECT a.*, ar.nombre as artista 
        FROM albumes a
        JOIN artistas ar ON a.id_artista = ar.id_artista
        ORDER BY a.año_lanzamiento DESC
    ");
    $albums = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($albums);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>