<?php
require_once 'php/db_connect.php';

try {
    $stmt = $pdo->query("SELECT 1");
    echo "Conexión a PostgreSQL exitosa!";
} catch (PDOException $e) {
    echo "Error de conexión: " . $e->getMessage();
}
?>