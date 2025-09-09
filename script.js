const taskInput = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const completedTasks = document.getElementById("completed-tasks");
const inprogressTasks = document.getElementById("inprogress-tasks");
const message = document.getElementById("message");
const completedCount = document.getElementById("completed-count");
const inprogressCount = document.getElementById("inprogress-count");

let taskIdCounter = 0; // معرف فريد لكل مهمة

// تحديث عداد الصناديق
function updateCounts() {
  completedCount.textContent = completedTasks.children.length;
  inprogressCount.textContent = inprogressTasks.children.length;
}

// عرض رسالة
function showMessage(text) {
  message.textContent = text;
  message.style.display = "block";
  setTimeout(() => message.style.display = "none", 1500);
}

// إنشاء عنصر مهمة
function createTaskElement(taskText, isCompleted = false) {
  const li = document.createElement("li");
  li.dataset.id = taskIdCounter++; // كل مهمة لها معرف فريد

  const spanText = document.createElement("span");
  spanText.textContent = taskText;
  spanText.classList.add("task-text");
  li.appendChild(spanText);

  // زر X
  const delBtn = document.createElement("button");
  delBtn.textContent = "X";
  delBtn.classList.add("delete-btn");
  li.appendChild(delBtn);

  // زر ✔ يظهر فقط في Completed
  if(isCompleted) {
    const doneBtn = document.createElement("button");
    doneBtn.textContent = "✔";
    doneBtn.classList.add("done-btn");
    li.appendChild(doneBtn);
  }

  return li;
}

// إزالة المهمة من جميع الحاويات حسب ID
function removeTaskById(taskId) {
  [taskList, inprogressTasks, completedTasks].forEach(container => {
    [...container.children].forEach(li => {
      if(li.dataset.id == taskId) li.remove();
    });
  });
}

// إضافة مهمة جديدة
function addTask() {
  const taskText = taskInput.value.trim();
  if(taskText === "") return;

  // إضافة للمستطيل الأوسط
  const liMiddle = createTaskElement(taskText);
  taskList.appendChild(liMiddle);

  // إضافة للمربع الأصفر
  const liInProgress = createTaskElement(taskText);
  liInProgress.dataset.id = liMiddle.dataset.id; // نفس الـID
  inprogressTasks.appendChild(liInProgress);

  taskInput.value = "";
  updateCounts();
}

// نقل المهمة للCompleted
function moveToCompleted(taskId, taskText) {
  removeTaskById(taskId);
  const li = createTaskElement(taskText, true);
  li.dataset.id = taskId;
  completedTasks.appendChild(li);
  showMessage("Great!");
  updateCounts();
}

// زر Add
addBtn.addEventListener("click", addTask);

// زر Enter
taskInput.addEventListener("keydown", function(e) {
  if(e.key === "Enter") addTask();
});

// التعامل مع الأزرار فقط (X) في Middle و In Progress
function handleTaskClick(e) {
  const li = e.target.closest("li");
  if(!li) return;

  const taskId = li.dataset.id;

  if(e.target.classList.contains("delete-btn")) {
    li.remove();
    updateCounts();
  }
}

// التعامل مع الدبل كليك لنقل المهمة للCompleted
function handleTaskDblClick(e) {
  const li = e.target.closest("li");
  if(!li) return;

  const taskId = li.dataset.id;
  const taskText = li.querySelector(".task-text").textContent;

  // لو مش موجودة في Completed → انقلها
  if(!li.parentElement.isSameNode(completedTasks)) {
    moveToCompleted(taskId, taskText);
  }
}

// الأحداث
taskList.addEventListener("click", handleTaskClick);
inprogressTasks.addEventListener("click", handleTaskClick);
taskList.addEventListener("dblclick", handleTaskDblClick);
inprogressTasks.addEventListener("dblclick", handleTaskDblClick);

// التعامل مع زر X أو ✔ في Completed
completedTasks.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if(!li) return;

  const taskId = li.dataset.id;
  const taskText = li.querySelector(".task-text").textContent;

  if(e.target.classList.contains("delete-btn")) {
    // X يرجع المهمة للمستطيل الأوسط والأصفر
    removeTaskById(taskId);
    const liMiddle = createTaskElement(taskText);
    const liInProgress = createTaskElement(taskText);
    liMiddle.dataset.id = taskId;
    liInProgress.dataset.id = taskId;
    taskList.appendChild(liMiddle);
    inprogressTasks.appendChild(liInProgress);
    updateCounts();
  } else if(e.target.classList.contains("done-btn")) {
    // ✔ يمسح المهمة مباشرة من Completed
    li.remove();
    updateCounts();
  }
});
