# To-Do List App - Copilot Instructions

## Architecture Overview

This is a **vanilla JavaScript + PHP** to-do list with MySQL persistence. No frameworks - pure DOM manipulation with dual storage (localStorage + database).

### Core Components

- `index.html` - Static structure with 3 predefined task slots (`task1-desc`, `task2-desc`, `task3-desc`)
- `script.js` - Frontend logic with dual task system (predefined vs custom)
- `database.php` - REST-like API endpoint handling `save_task` and `get_tasks` actions
- Auto-schema creation on first run (no manual DB setup required)

## Critical Data Flow Patterns

### Task ID System

- **Tasks 1-3**: Use predefined slots in HTML, type = "predefined"
- **Tasks 4+**: Dynamically created DOM elements, type = "custom"
- `currentTask` counter tracks next available task number
- Database uses `task_id` (business ID) + `id` (auto-increment primary key)

### Dual Storage Strategy

```javascript
// Always save to BOTH localStorage AND database
saveTasksToStorage() → calls saveAllTasksToDatabase()
```

### Event Listener Pattern

```javascript
// Centralized to prevent duplicate listeners
attachCheckboxListener(checkbox); // Sets "data-listener-added" attribute
enableTaskEditing(spanElement); // Click-to-edit functionality
```

## Database Schema

```sql
tasks (
  task_id INT UNIQUE,     -- Business ID (1,2,3,4...)
  task_text VARCHAR(255), -- User content
  task_type ENUM('predefined', 'custom'),
  completed BOOLEAN
)
```

## Key Implementation Patterns

### Task Creation Flow

1. `currentTask++` determines next ID
2. If ≤3: populate existing HTML slot + assign random predefined text
3. If >3: create new `<li>` DOM element with input field
4. Input blur → convert to span with `enableTaskEditing()`

### Database Communication

```javascript
// POST to database.php with URLSearchParams
fetch("database.php", {
  body: new URLSearchParams({
    action: "save_task", // or "get_tasks"
    taskId: task.taskId,
    text: task.text,
    completed: task.completed ? "true" : "false",
    type: task.type,
  }),
});
```

### Page Load Sequence

1. Attach listeners to existing checkboxes
2. Enable editing on predefined task elements
3. `getTaskData()` loads from database
4. `renderTaskFromDatabase()` populates DOM + updates `currentTask` counter

## Development Workflow

### Local Setup

```bash
php -S localhost:8000  # Start dev server
# Navigate to localhost:8000/index.html
```

### Database Auto-Creation

- `database.php` creates `todo_app` database and `tasks` table on first request
- No manual MySQL setup required (uses root/no password defaults)

### Debugging Tasks

- Use browser console to inspect `currentTask`, `usedTasks` arrays
- Database responses logged to console in `saveTaskToDatabase()`
- Check Network tab for database.php POST requests

## Critical Conventions

### Task Element Selection

```javascript
// For predefined tasks (1-3)
const taskElement = taskElements[task.task_id - 1]; // Zero-indexed array

// For custom tasks (4+)
document.getElementById(`task${task.task_id}-desc`); // ID pattern
```

### Editing State Management

- Input fields have class `task-input`
- Span elements have class `taskDesc`
- Blur event converts input→span, Enter key triggers blur
- `saveTasksToStorage()` called on every edit

### Random Task Assignment

- `predefinedTasks` array contains German task examples
- `usedTasks` prevents duplicates, resets when exhausted
- Only applied to tasks 1-3 on "Add Task" button click

## Common Gotchas

- **Task ID confusion**: HTML uses 1-based IDs, JavaScript arrays are 0-indexed
- **Event listener duplicates**: Always check `data-listener-added` attribute
- **Database column names**: Use `task_text`/`task_type` not `text`/`type`
- **Custom task detection**: Tasks >3 are custom, but check `task_type` field for certainty
