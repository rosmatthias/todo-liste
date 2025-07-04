<?php
// Test der Datenbankverbindung und Schema-Erstellung
$host = 'localhost';
$dbname = 'todo_app';
$username = 'root';
$password = '';

try {
    // Verbindung ohne spezifische Datenbank
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Erstelle Datenbank falls nicht vorhanden
    $pdo->exec("CREATE DATABASE IF NOT EXISTS $dbname");
    echo "✅ Datenbank '$dbname' erstellt/existiert.\n";
    
    // Verwende die Datenbank
    $pdo->exec("USE $dbname");
    
    // Lösche die alte Tabelle falls sie existiert (für sauberen Neustart)
    $pdo->exec("DROP TABLE IF EXISTS tasks");
    echo "🗑️  Alte Tabelle entfernt.\n";
    
    // Erstelle Tabelle mit korrekten Spalten
    $createTable = "
    CREATE TABLE tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT UNIQUE NOT NULL,
        task_text VARCHAR(255) NOT NULL,
        task_type ENUM('predefined', 'custom') NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    $pdo->exec($createTable);
    echo "✅ Tabelle 'tasks' neu erstellt.\n";
    
    // Erstelle Indizes
    $pdo->exec("CREATE INDEX idx_task_id ON tasks(task_id)");
    $pdo->exec("CREATE INDEX idx_completed ON tasks(completed)");
    echo "✅ Indizes erstellt.\n";
    
    // Prüfe ob Tabelle Daten hat
    $stmt = $pdo->query("SELECT COUNT(*) FROM tasks");
    $count = $stmt->fetchColumn();
    echo "📊 Anzahl Tasks in DB: $count\n";
    
    // Zeige alle Tasks (falls vorhanden)
    if ($count > 0) {
        $stmt = $pdo->query("SELECT * FROM tasks ORDER BY task_id");
        $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "📋 Vorhandene Tasks:\n";
        foreach ($tasks as $task) {
            echo "   ID: {$task['task_id']}, Text: {$task['task_text']}, Type: {$task['task_type']}, Completed: {$task['completed']}\n";
        }
    } else {
        echo "📋 Keine Tasks vorhanden - Datenbank ist leer und bereit.\n";
    }
    
    echo "\n✅ Datenbanktest erfolgreich! Die Datenbank ist bereit für die To-Do App.";
    
} catch (PDOException $e) {
    echo "❌ Datenbankfehler: " . $e->getMessage();
}
?>
