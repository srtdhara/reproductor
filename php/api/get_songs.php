<?php
require_once '../db_connect.php';

$artist_id = isset($_GET['artist_id']) ? (int)$_GET['artist_id'] : null;
$album_id = isset($_GET['album_id']) ? (int)$_GET['album_id'] : null;
$playlist_id = isset($_GET['playlist_id']) ? (int)$_GET['playlist_id'] : null;
$search = isset($_GET['search']) ? $_GET['search'] : null;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : null;

try {
    $query = "
        SELECT 
            c.id_cancion, 
            c.titulo, 
            ar.nombre as artista, 
            al.titulo as album, 
            c.duracion, 
            c.url
        FROM canciones c
        JOIN artistas ar ON c.id_artista = ar.id_artista
        LEFT JOIN albumes al ON c.id_album = al.id_album
    ";
    
    $conditions = [];
    $params = [];
    
    if ($artist_id) {
        $order = isset($_GET['order']) ? $_GET['order'] : 'titulo';
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 0;
        
        // Si se especifica un orden especial, usar la función
        if (in_array($order, ['album', 'duracion', 'titulo'])) {
            $query = "SELECT * FROM obtener_canciones_artista(?, ?, ?)";
            $params = [$artist_id, $order, $limit];
        } else {
            $conditions[] = "c.id_artista = ?";
            $params[] = $artist_id;
        }
    }
    
    if ($album_id) {
        $conditions[] = "c.id_album = ?";
        $params[] = $album_id;
    }
    
    if ($playlist_id) {
        $query .= " JOIN canciones_lista cl ON c.id_cancion = cl.id_cancion";
        $conditions[] = "cl.id_lista = ?";
        $params[] = $playlist_id;
    }
    
    if ($search) {
        $conditions[] = "(c.titulo LIKE ? OR ar.nombre LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    if (!empty($conditions)) {
        $query .= " WHERE " . implode(" AND ", $conditions);
    }
    
    $query .= " ORDER BY c.titulo";
    
    if ($limit) {
        $query .= " LIMIT ?";
        $params[] = $limit;
    }
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $songs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($songs);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>