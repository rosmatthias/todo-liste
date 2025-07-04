<?php
// Datenbank leeren
$host = 'localhost';
$dbname = 'todo_app';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Lösche alle Tasks aus der Datenbank
    $pdo->exec("DELETE FROM tasks");
    
    // Reset Auto-Increment (optional)
    $pdo->exec("ALTER TABLE tasks AUTO_INCREMENT = 1");
    
    echo "✅ Datenbank wurde geleert. Alle Tasks wurden entfernt.\n";
    echo "🔄 Die Datenbank ist jetzt bereit für Ihre eigenen Tasks.\n";
    
    // Prüfe ob leer
    $stmt = $pdo->query("SELECT COUNT(*) FROM tasks");
    $count = $stmt->fetchColumn();
    echo "📊 Anzahl Tasks in DB: $count\n";
    
} catch (PDOException $e) {
    echo "❌ Datenbankfehler: " . $e->getMessage();
}
?>
