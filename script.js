// كود التودو لست الأصلي
const taskInput = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const completedTasks = document.getElementById("completed-tasks");
const inprogressTasks = document.getElementById("inprogress-tasks");
const message = document.getElementById("message");
const completedCount = document.getElementById("completed-count");
const inprogressCount = document.getElementById("inprogress-count");

let taskIdCounter = 0; // معرف فريد لكل مهمة

function updateCounts() {
  completedCount.textContent = completedTasks.children.length;
  inprogressCount.textContent = inprogressTasks.children.length;
}

function showMessage(text) {
  message.textContent = text;
  message.style.display = "block";
  setTimeout(() => message.style.display = "none", 1500);
}

function createTaskElement(taskText, isCompleted = false) {
  const li = document.createElement("li");
  li.dataset.id = taskIdCounter++;

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

function removeTaskById(taskId) {
  [taskList, inprogressTasks, completedTasks].forEach(container => {
    [...container.children].forEach(li => {
      if(li.dataset.id == taskId) li.remove();
    });
  });
}

function addTask() {
  const taskText = taskInput.value.trim();
  if(taskText === "") return;

  const liMiddle = createTaskElement(taskText);
  taskList.appendChild(liMiddle);

  const liInProgress = createTaskElement(taskText);
  liInProgress.dataset.id = liMiddle.dataset.id;
  inprogressTasks.appendChild(liInProgress);

  taskInput.value = "";
  updateCounts();
}

function moveToCompleted(taskId, taskText) {
  removeTaskById(taskId);
  const li = createTaskElement(taskText, true);
  li.dataset.id = taskId;
  completedTasks.appendChild(li);
  showMessage("Great!");
  updateCounts();
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", function(e) {
  if(e.key === "Enter") addTask();
});

function handleTaskClick(e) {
  const li = e.target.closest("li");
  if(!li) return;

  const taskId = li.dataset.id;

  if(e.target.classList.contains("delete-btn")) {
    li.remove();
    updateCounts();
  }
}

function handleTaskDblClick(e) {
  const li = e.target.closest("li");
  if(!li) return;

  const taskId = li.dataset.id;
  const taskText = li.querySelector(".task-text").textContent;

  if(!li.parentElement.isSameNode(completedTasks)) {
    moveToCompleted(taskId, taskText);
  }
}

taskList.addEventListener("click", handleTaskClick);
inprogressTasks.addEventListener("click", handleTaskClick);
taskList.addEventListener("dblclick", handleTaskDblClick);
inprogressTasks.addEventListener("dblclick", handleTaskDblClick);

completedTasks.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if(!li) return;

  const taskId = li.dataset.id;
  const taskText = li.querySelector(".task-text").textContent;

  if(e.target.classList.contains("delete-btn")) {
    removeTaskById(taskId);
    const liMiddle = createTaskElement(taskText);
    const liInProgress = createTaskElement(taskText);
    liMiddle.dataset.id = taskId;
    liInProgress.dataset.id = taskId;
    taskList.appendChild(liMiddle);
    inprogressTasks.appendChild(liInProgress);
    updateCounts();
  } else if(e.target.classList.contains("done-btn")) {
    li.remove();
    updateCounts();
  }
});

// كود Hamburger Menu
const menuBtn = document.getElementById("menu-btn");
const menuDropdown = document.getElementById("menu-dropdown");

menuBtn.addEventListener("click", () => {
  menuDropdown.style.display = menuDropdown.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", (e) => {
  if(!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
    menuDropdown.style.display = "none";
  }
});
