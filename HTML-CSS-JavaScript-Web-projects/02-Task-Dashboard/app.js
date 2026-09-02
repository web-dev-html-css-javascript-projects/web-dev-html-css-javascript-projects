// --- 1. Initial State & LocalStorage ---
let tasks = JSON.parse(localStorage.getItem("taskflow_tasks")) || [
    {
        id: 1,
        title: "Complete HTML & CSS Interview Prep",
        desc: "Review all semantic tags and master Grid/Flexbox layouts.",
        priority: "High",
        category: "Study",
        dueDate: "2026-09-05",
        completed: true
    },
    {
        id: 2,
        title: "Build E-Commerce Web App",
        desc: "Implement product catalog, search filters, and cart drawer.",
        priority: "High",
        category: "Coding",
        dueDate: "2026-09-08",
        completed: true
    },
    {
        id: 3,
        title: "Master JavaScript Async/Await & APIs",
        desc: "Practice fetching data and handling JSON responses.",
        priority: "Medium",
        category: "Coding",
        dueDate: "2026-09-12",
        completed: false
    }
];

let isDarkMode = JSON.parse(localStorage.getItem("taskflow_dark_mode")) || false;

// --- 2. DOM Elements ---
const taskForm = document.getElementById("taskForm");
const formTitle = document.getElementById("formTitle");
const editTaskId = document.getElementById("editTaskId");
const taskTitle = document.getElementById("taskTitle");
const taskDesc = document.getElementById("taskDesc");
const taskPriority = document.getElementById("taskPriority");
const taskCategory = document.getElementById("taskCategory");
const taskDueDate = document.getElementById("taskDueDate");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const filterPills = document.querySelectorAll(".filter-pill");
const priorityFilter = document.getElementById("priorityFilter");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");

// Stats Elements
const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");
const progressPercentage = document.getElementById("progressPercentage");
const progressBarFill = document.getElementById("progressBarFill");

// Theme Toggle
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeText = document.getElementById("themeText");

// --- 3. Theme Toggle Functionality ---
function applyTheme() {
    if (isDarkMode) {
        document.body.classList.add("dark-mode");
        themeToggleBtn.innerHTML = "☀️ <span id='themeText'>Light</span>";
    } else {
        document.body.classList.remove("dark-mode");
        themeToggleBtn.innerHTML = "🌙 <span id='themeText'>Dark</span>";
    }
    localStorage.setItem("taskflow_dark_mode", JSON.stringify(isDarkMode));
}

themeToggleBtn.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    applyTheme();
});

// --- 4. Render Tasks & Stats ---
let currentStatusFilter = "all";

function renderTasks() {
    const query = searchInput.value.toLowerCase().trim();
    const selectedPriority = priorityFilter.value;

    const filtered = tasks.filter(task => {
        // Status match
        const matchesStatus = (currentStatusFilter === "all") ||
            (currentStatusFilter === "pending" && !task.completed) ||
            (currentStatusFilter === "completed" && task.completed);
        
        // Priority match
        const matchesPriority = (selectedPriority === "all" || task.priority === selectedPriority);

        // Search match
        const matchesSearch = task.title.toLowerCase().includes(query) || 
                              task.desc.toLowerCase().includes(query) ||
                              task.category.toLowerCase().includes(query);

        return matchesStatus && matchesPriority && matchesSearch;
    });

    taskList.innerHTML = "";

    if (filtered.length === 0) {
        emptyState.classList.remove("hidden");
    } else {
        emptyState.classList.add("hidden");
        filtered.forEach(task => {
            const taskDiv = document.createElement("div");
            taskDiv.className = `task-item ${task.completed ? "completed" : ""}`;
            taskDiv.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""} onchange="toggleTask(${task.id})">
                <div class="task-content">
                    <h4 class="task-title">${task.title}</h4>
                    ${task.desc ? `<p class="task-desc">${task.desc}</p>` : ""}
                    <div class="task-meta">
                        <span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span>
                        <span class="badge badge-category">📁 ${task.category}</span>
                        ${task.dueDate ? `<span class="due-date">📅 Due: ${task.dueDate}</span>` : ""}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-icon" title="Edit" onclick="editTask(${task.id})">✏️</button>
                    <button class="btn-icon btn-delete" title="Delete" onclick="deleteTask(${task.id})">🗑️</button>
                </div>
            `;
            taskList.appendChild(taskDiv);
        });
    }

    updateStats();
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    totalCount.textContent = total;
    pendingCount.textContent = pending;
    completedCount.textContent = completed;
    progressPercentage.textContent = `${percentage}%`;
    progressBarFill.style.width = `${percentage}%`;
}

function saveTasks() {
    localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
}

// --- 5. Add / Update Task Logic ---
taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = editTaskId.value;
    const title = taskTitle.value.trim();
    const desc = taskDesc.value.trim();
    const priority = taskPriority.value;
    const category = taskCategory.value;
    const dueDate = taskDueDate.value;

    if (id) {
        // Update existing task
        const task = tasks.find(t => t.id === parseInt(id));
        if (task) {
            task.title = title;
            task.desc = desc;
            task.priority = priority;
            task.category = category;
            task.dueDate = dueDate;
        }
        resetForm();
    } else {
        // Create new task
        const newTask = {
            id: Date.now(),
            title,
            desc,
            priority,
            category,
            dueDate,
            completed: false
        };
        tasks.unshift(newTask);
        taskForm.reset();
    }

    saveTasks();
    renderTasks();
});

// --- 6. Task Actions (Toggle, Delete, Edit, Clear) ---
window.toggleTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
};

window.deleteTask = function(id) {
    if (confirm("Are you sure you want to delete this task?")) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }
};

window.editTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editTaskId.value = task.id;
    taskTitle.value = task.title;
    taskDesc.value = task.desc || "";
    taskPriority.value = task.priority;
    taskCategory.value = task.category;
    taskDueDate.value = task.dueDate || "";

    formTitle.textContent = "✏️ Edit Task";
    saveTaskBtn.textContent = "Update Task";
    cancelEditBtn.classList.remove("hidden");

    window.scrollTo({ top: 0, behavior: "smooth" });
};

function resetForm() {
    editTaskId.value = "";
    taskForm.reset();
    formTitle.textContent = "➕ Add New Task";
    saveTaskBtn.textContent = "Save Task";
    cancelEditBtn.classList.add("hidden");
}

cancelEditBtn.addEventListener("click", resetForm);

clearCompletedBtn.addEventListener("click", () => {
    const completedTasks = tasks.filter(t => t.completed);
    if (completedTasks.length === 0) {
        alert("No completed tasks to clear!");
        return;
    }
    if (confirm("Clear all completed tasks?")) {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
    }
});

// --- 7. Search and Filtering Listeners ---
searchInput.addEventListener("input", renderTasks);
priorityFilter.addEventListener("change", renderTasks);

filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
        filterPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        currentStatusFilter = pill.dataset.filter;
        renderTasks();
    });
});

// --- 8. Initial App Load ---
applyTheme();
renderTasks();