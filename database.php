<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$host = 'localhost';
$dbname = 'todo_app';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Erstelle Datenbank und Tabelle falls sie nicht existieren
    $pdo->exec("CREATE DATABASE IF NOT EXISTS $dbname");
    $pdo->exec("USE $dbname");
    
    $createTable = "
    CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT UNIQUE NOT NULL,
        task_text VARCHAR(255) NOT NULL,
        task_type ENUM('predefined', 'custom') NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $pdo->exec($createTable);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $action = $_POST['action'] ?? '';

        if ($action === "update_checkbox" || $action === "save_task") {
            $taskid = (int) ($_POST["taskId"] ?? 0);
            $text = $_POST["text"] ?? '';
            $completed = ($_POST["completed"] ?? 'false') === "true" ? 1 : 0;
            $type = $_POST["type"] ?? "custom";
            $created_at = date("Y-m-d H:i:s");

            if (trim($text) === '') {
                echo json_encode(['status' => 'error', 'message' => 'Aufgabentext darf nicht leer sein']);
                exit;
            }

            $stmt = $pdo->prepare("SELECT COUNT(*) FROM tasks WHERE task_id = ?");
            $stmt->execute([$taskid]);
            $exists = $stmt->fetchColumn() > 0;

            if ($exists) {
                $stmt = $pdo->prepare("UPDATE tasks SET task_text = ?, completed = ?, task_type = ? WHERE task_id = ?");
                $stmt->execute([$text, $completed, $type, $taskid]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO tasks (task_id, task_text, completed, task_type, created_at) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$taskid, $text, $completed, $type, $created_at]);
            }

            echo json_encode(['status' => 'success', 'message' => 'Task saved successfully']);
            exit;
        }

        if ($action === "get_tasks") {
            $stmt = $pdo->query("SELECT * FROM tasks ORDER BY task_id ASC");
            $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['status' => 'success', 'tasks' => $tasks]);
            exit;
        }
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Keine gültige Aktion angegeben']);
?>