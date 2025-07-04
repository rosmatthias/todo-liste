const saveTasksToStorage = function () {
  const allTaskDescriptions = [];

  // Save first 3 predefined tasks with checkbox status
  taskElements.forEach((el, index) => {
    if (el.textContent.trim() !== "") {
      const checkbox = el.closest("li").querySelector('input[type="checkbox"]');
      allTaskDescriptions.push({
        type: "predefined",
        text: el.textContent.trim(),
        completed: checkbox ? checkbox.checked : false,
        taskId: index + 1,
      });
    }
  });

  // Save dynamic input tasks with checkbox status
  const dynamicInputs = document.querySelectorAll(".task-input");
  dynamicInputs.forEach((input, index) => {
    if (input.value.trim() !== "") {
      const checkbox = input
        .closest("li")
        .querySelector('input[type="checkbox"]');
      allTaskDescriptions.push({
        type: "custom",
        text: input.value.trim(),
        completed: checkbox ? checkbox.checked : false,
        taskId: taskElements.length + index + 1,
      });
    }
  });

  // Save dynamic span tasks (converted from inputs) with checkbox status
  const dynamicSpans = document.querySelectorAll(
    ".taskDesc:not([id$='-desc'])"
  );
  dynamicSpans.forEach((span, index) => {
    if (span.textContent.trim() !== "" && !span.id.match(/^task[1-3]-desc$/)) {
      const checkbox = span
        .closest("li")
        .querySelector('input[type="checkbox"]');
      const taskId = span.id.match(/\d+/);
      allTaskDescriptions.push({
        type: "custom",
        text: span.textContent.trim(),
        completed: checkbox ? checkbox.checked : false,
        taskId: taskId ? parseInt(taskId[0]) : taskElements.length + index + 1,
      });
    }
  });

  localStorage.setItem("todoTasks", JSON.stringify(allTaskDescriptions));
  localStorage.setItem("currentTask", currentTask.toString());
  localStorage.setItem("usedTasks", JSON.stringify(usedTasks));

  // Save to database
  saveAllTasksToDatabase();
};

const addTaskButton = document.getElementsByClassName("add-task")[0];
const task1Desc = document.getElementById("task1-desc");
const task2Desc = document.getElementById("task2-desc");
const task3Desc = document.getElementById("task3-desc");
let currentTask = 0;

// Predefined tasks for better maintainability
const predefinedTasks = [
  "Einkaufen gehen",
  "Hausaufgaben machen",
  "Sport treiben",
  "E-Mails beantworten",
  "Zimmer aufräumen",
  "Buch lesen",
  "Freunde anrufen",
  "Spazieren gehen",
  "Kochen lernen",
  "Pflanzen gießen",
];

let usedTasks = [];

// Reference the correct description elements
const taskElements = [task1Desc, task2Desc, task3Desc];

// Function to get a random unused task
const getRandomTask = function () {
  if (usedTasks.length >= predefinedTasks.length) {
    usedTasks = [];
  }

  let availableTasks = predefinedTasks.filter(
    (task) => !usedTasks.includes(task)
  );
  let randomIndex = Math.floor(Math.random() * availableTasks.length);
  let selectedTask = availableTasks[randomIndex];

  usedTasks.push(selectedTask);
  return selectedTask;
};

// Centralized function to attach checkbox listeners
function attachCheckboxListener(checkbox) {
  if (!checkbox.hasAttribute("data-listener-added")) {
    checkbox.addEventListener("change", function () {
      saveTasksToStorage();
      sendToDatabase(this.closest("li"));
    });
    checkbox.setAttribute("data-listener-added", "true");
  }
}

// Function to enable task editing
function enableTaskEditing(spanElement) {
  spanElement.addEventListener("click", function () {
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "task-input";
    editInput.id = spanElement.id;
    editInput.value = spanElement.textContent;

    editInput.addEventListener("blur", function () {
      const newText = editInput.value.trim();
      spanElement.textContent = newText;
      editInput.replaceWith(spanElement);
      saveTasksToStorage();
    });

    editInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        editInput.blur();
      }
    });

    spanElement.replaceWith(editInput);
    editInput.focus();
    editInput.select();
  });
}

// Fixed function to send single task to database
async function sendToDatabase(taskElement) {
  try {
    const taskId = extractTaskId(taskElement);
    const taskText = getTaskText(taskElement);
    const checkbox = taskElement.querySelector('input[type="checkbox"]');
    const isCompleted = checkbox ? checkbox.checked : false;
    const taskType = taskId <= 3 ? "predefined" : "custom";

    await saveTaskToDatabase({
      taskId: taskId,
      text: taskText,
      completed: isCompleted,
      type: taskType,
    });
  } catch (error) {
    console.error("Error sending to database:", error);
  }
}

// Helper function to extract task ID from element
function extractTaskId(taskElement) {
  const taskSpan = taskElement.querySelector('[id^="task"]');
  if (taskSpan) {
    const match = taskSpan.id.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }
  return 0;
}

// Helper function to get task text
function getTaskText(taskElement) {
  const taskDesc = taskElement.querySelector(".taskDesc, .task-input");
  if (taskDesc) {
    return taskDesc.textContent || taskDesc.value || "";
  }
  return "";
}

// Fixed function to save all tasks to database
async function saveAllTasksToDatabase() {
  const allTasks = [];

  // Predefined tasks
  taskElements.forEach((el, index) => {
    if (el.textContent.trim() !== "") {
      const checkbox = el.closest("li").querySelector('input[type="checkbox"]');
      allTasks.push({
        taskId: index + 1,
        text: el.textContent.trim(),
        type: "predefined",
        completed: checkbox ? checkbox.checked : false,
      });
    }
  });

  // Custom input tasks
  const dynamicInputs = document.querySelectorAll(".task-input");
  dynamicInputs.forEach((input, index) => {
    if (input.value.trim() !== "") {
      const checkbox = input
        .closest("li")
        .querySelector('input[type="checkbox"]');
      const taskId = input.id.match(/\d+/);
      allTasks.push({
        taskId: taskId ? parseInt(taskId[0]) : taskElements.length + index + 1,
        text: input.value.trim(),
        type: "custom",
        completed: checkbox ? checkbox.checked : false,
      });
    }
  });

  // Custom span tasks (converted from inputs)
  const dynamicSpans = document.querySelectorAll(
    ".taskDesc:not([id$='-desc'])"
  );
  dynamicSpans.forEach((span, index) => {
    if (span.textContent.trim() !== "" && !span.id.match(/^task[1-3]-desc$/)) {
      const checkbox = span
        .closest("li")
        .querySelector('input[type="checkbox"]');
      const taskId = span.id.match(/\d+/);
      allTasks.push({
        taskId: taskId ? parseInt(taskId[0]) : taskElements.length + index + 1,
        text: span.textContent.trim(),
        type: "custom",
        completed: checkbox ? checkbox.checked : false,
      });
    }
  });

  // Send all tasks to database
  for (const task of allTasks) {
    try {
      await saveTaskToDatabase(task);
    } catch (error) {
      console.error("Error saving task:", error, task);
    }
  }
}

// Main button click handler
const handleButtonClick = function () {
  currentTask++;

  if (currentTask <= 3) {
    const taskElement = taskElements[currentTask - 1];

    if (taskElement.textContent.trim() === "") {
      taskElement.textContent = getRandomTask();
    }

    const existingCheckbox = taskElement
      .closest("li")
      .querySelector('input[type="checkbox"]');
    if (existingCheckbox) {
      attachCheckboxListener(existingCheckbox);
    }

    enableTaskEditing(taskElement);
    saveTasksToStorage();
  } else {
    const newTask = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    attachCheckboxListener(checkbox);

    const taskLabel = document.createElement("span");
    taskLabel.classList.add("taskName");
    taskLabel.id = `task${currentTask}`;
    taskLabel.textContent = `Task ${currentTask}`;

    const taskInput = document.createElement("input");
    taskInput.type = "text";
    taskInput.id = `task${currentTask}-desc`;
    taskInput.placeholder = "Gib deine Aufgabe ein...";
    taskInput.className = "task-input";

    taskInput.addEventListener("input", function () {
      saveTasksToStorage();
    });

    taskInput.addEventListener("blur", function () {
      const taskName = taskInput.value.trim();
      if (!taskName) return;

      const taskDesc = document.createElement("span");
      taskDesc.id = `task${currentTask}-desc`;
      taskDesc.classList.add("taskDesc");
      taskDesc.textContent = taskName;

      taskInput.replaceWith(taskDesc);
      enableTaskEditing(taskDesc);
      saveTasksToStorage();
    });

    taskInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        taskInput.blur();
      }
    });

    newTask.appendChild(checkbox);
    newTask.appendChild(document.createTextNode(" "));
    newTask.appendChild(taskLabel);
    newTask.appendChild(taskInput);
    const todoList = document.querySelector(".todo-list");
    todoList.appendChild(newTask);
    saveTasksToStorage();
  }
};

// Add button event listener
addTaskButton.addEventListener("click", handleButtonClick);

// Function to save individual task to database
async function saveTaskToDatabase(task) {
  try {
    const response = await fetch("database.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        action: "save_task",
        taskId: task.taskId,
        text: task.text,
        completed: task.completed ? "true" : "false",
        type: task.type,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Fehler beim Speichern in DB:", error);
    throw error;
  }
}

// Function to render task from database
function renderTaskFromDatabase(task) {
  if (task.task_id <= 3 && task.task_type === "predefined") {
    // Predefined tasks (1-3) - only update if they have content
    const taskElement = taskElements[task.task_id - 1];
    if (taskElement && task.task_text.trim() !== "") {
      taskElement.textContent = task.task_text;

      // Add the task to usedTasks to prevent duplicates
      if (!usedTasks.includes(task.task_text)) {
        usedTasks.push(task.task_text);
      }

      const checkbox = taskElement
        .closest("li")
        .querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.checked = task.completed == 1;
        // Add event listener if not already added
        attachCheckboxListener(checkbox);
      }
      // Enable editing for the task element
      enableTaskEditing(taskElement);
    }
  } else if (task.task_id > 3 && task.task_type === "custom") {
    // Custom tasks (4+) - only create if they have content and don't already exist
    if (
      task.task_text.trim() !== "" &&
      !document.getElementById(`task${task.task_id}-desc`)
    ) {
      createCustomTaskFromDatabase(task);
    }
  }
}

// Function to create custom task from database
function createCustomTaskFromDatabase(task) {
  const newTask = document.createElement("li");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed == 1;

  // Use the centralized function to attach checkbox listener
  attachCheckboxListener(checkbox);

  const taskLabel = document.createElement("span");
  taskLabel.classList.add("taskName");
  taskLabel.id = `task${task.task_id}`;
  taskLabel.textContent = `Task ${task.task_id}`;

  const taskDesc = document.createElement("span");
  taskDesc.id = `task${task.task_id}-desc`;
  taskDesc.classList.add("taskDesc");
  taskDesc.textContent = task.task_text;

  // Enable editing for the task description
  enableTaskEditing(taskDesc);

  newTask.appendChild(checkbox);
  newTask.appendChild(document.createTextNode(" "));
  newTask.appendChild(taskLabel);
  newTask.appendChild(taskDesc);

  document.querySelector(".todo-list").appendChild(newTask);
}

// Function to load tasks from database
function getTaskData() {
  fetch("database.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      action: "get_tasks",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success" && data.tasks) {
        usedTasks = [];

        const predefinedTasks = data.tasks.filter(
          (task) => task.task_id <= 3 && task.task_type === "predefined"
        );
        const customTasks = data.tasks.filter(
          (task) => task.task_id > 3 && task.task_type === "custom"
        );

        let maxPredefinedTask = 0;
        predefinedTasks.forEach((task) => {
          if (task.task_id <= 3) {
            renderTaskFromDatabase(task);
            maxPredefinedTask = Math.max(maxPredefinedTask, task.task_id);
          }
        });

        currentTask = maxPredefinedTask;

        customTasks.forEach((task) => {
          renderTaskFromDatabase(task);
          currentTask = Math.max(currentTask, task.task_id);
        });
      }
    })
    .catch((error) => {
      console.error("Fehler beim Laden der Datenbank-Daten:", error);
    });
}

// Load tasks when page loads
window.addEventListener("load", () => {
  const existingCheckboxes = document.querySelectorAll(
    'input[type="checkbox"]'
  );
  existingCheckboxes.forEach((checkbox) => {
    attachCheckboxListener(checkbox);
  });

  taskElements.forEach((element) => {
    enableTaskEditing(element);
  });

  getTaskData();
});
