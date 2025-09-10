const taskInput = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const completedTasks = document.getElementById("completed-tasks");
const inprogressTasks = document.getElementById("inprogress-tasks");
const message = document.getElementById("message");
const completedCount = document.getElementById("completed-count");
const inprogressCount = document.getElementById("inprogress-count");

const hamburger = document.getElementById("hamburger");
const dropdownMenu = document.getElementById("dropdown-menu");

let taskIdCounter = 0;
const MAX_HEIGHT = 400;

// Hamburger Menu toggle
hamburger.addEventListener("click", () => {
  dropdownMenu.classList.toggle("show");
});

// حفظ المهام
function saveTasks() {
  const tasks = [];
  [...taskList.children].forEach(li => {
    const id = parseInt(li.dataset.id);
    const text = li.querySelector(".task-text").textContent;
    tasks.push({ id, text, completed: false });
  });
  [...completedTasks.children].forEach(li => {
    const id = parseInt(li.dataset.id);
    const text = li.querySelector(".task-text").textContent;
    tasks.push({ id, text, completed: true });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// تحميل المهام
function loadTasks() {
  const savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  savedTasks.forEach(task => {
    taskIdCounter = Math.max(taskIdCounter, task.id + 1);
    const liMiddle = createTaskElement(task.text, task.id);
    taskList.appendChild(liMiddle);

    const liInProgress = createTaskElement(task.text, task.id);
    inprogressTasks.appendChild(liInProgress);

    if(task.completed) moveToCompleted(task.id, task.text, false);
  });
  updateCounts();
}

function showMessage(text) {
  message.textContent = text;
  message.style.display = "block";
  setTimeout(() => message.style.display = "none", 1500);
}

function createTaskElement(taskText, taskId = null, isCompleted = false) {
  const li = document.createElement("li");
  li.dataset.id = taskId !== null ? taskId : taskIdCounter++;

  const spanText = document.createElement("span");
  spanText.textContent = taskText;
  spanText.classList.add("task-text");
  li.appendChild(spanText);

  const delBtn = document.createElement("button");
  delBtn.textContent = "X";
  delBtn.classList.add("delete-btn");
  li.appendChild(delBtn);

  if(isCompleted) {
    const doneBtn = document.createElement("button");
    doneBtn.textContent = "✔";
    doneBtn.classList.add("done-btn");
    li.appendChild(doneBtn);
  }

  return li;
}

function updateCounts() {
  completedCount.textContent = completedTasks.children.length;
  inprogressCount.textContent = inprogressTasks.children.length;
  updateDynamicHeight();
  saveTasks();
}

function updateDynamicHeight() {
  const baseHeight = 50;
  const perItem = 40;
  inprogressTasks.style.height = `${Math.min(baseHeight + perItem * inprogressTasks.children.length, MAX_HEIGHT)}px`;
  completedTasks.style.height = `${Math.min(baseHeight + perItem * completedTasks.children.length, MAX_HEIGHT)}px`;
}

function addTask() {
  const taskText = taskInput.value.trim();
  if(taskText === "") return;

  const liMiddle = createTaskElement(taskText);
  taskList.appendChild(liMiddle);

  const liInProgress = createTaskElement(taskText, liMiddle.dataset.id);
  inprogressTasks.appendChild(liInProgress);

  taskInput.value = "";
  updateCounts();
}

// مسح كل النسخ اللي ليها نفس ID
function removeTaskById(taskId) {
  [taskList, inprogressTasks, completedTasks].forEach(container => {
    [...container.children].forEach(li => {
      if(li.dataset.id == taskId) li.remove();
    });
  });
}

// نقل للـ Completed
function moveToCompleted(taskId, taskText, showMsg = true) {
  removeTaskById(taskId);
  const li = createTaskElement(taskText, taskId, true);
  completedTasks.appendChild(li);
  if(showMsg) showMessage("Great!");
  updateCounts();
}

// الأحداث
addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", e => { if(e.key === "Enter") addTask(); });

function handleTaskClick(e) {
  const li = e.target.closest("li");
  if(!li) return;
  const taskId = li.dataset.id;

  if(e.target.classList.contains("delete-btn")) {
    removeTaskById(taskId);
    updateCounts();
  }
}

function handleTaskDblClick(e) {
  const li = e.target.closest("li");
  if(!li) return;
  const taskId = li.dataset.id;
  const taskText = li.querySelector(".task-text").textContent;

  if(!li.parentElement.isSameNode(completedTasks)) moveToCompleted(taskId, taskText);
}

taskList.addEventListener("click", handleTaskClick);
inprogressTasks.addEventListener("click", handleTaskClick);
taskList.addEventListener("dblclick", handleTaskDblClick);
inprogressTasks.addEventListener("dblclick", handleTaskDblClick);

completedTasks.addEventListener("click", e => {
  const li = e.target.closest("li");
  if(!li) return;
  const taskId = li.dataset.id;
  const taskText = li.querySelector(".task-text").textContent;

  if(e.target.classList.contains("delete-btn")) {
    removeTaskById(taskId);
    const liMiddle = createTaskElement(taskText, taskId);
    const liInProgress = createTaskElement(taskText, taskId);
    taskList.appendChild(liMiddle);
    inprogressTasks.appendChild(liInProgress);
    updateCounts();
  } else if(e.target.classList.contains("done-btn")) {
    removeTaskById(taskId);
    updateCounts();
  }
});

// تحميل المهام عند البداية
loadTasks();
