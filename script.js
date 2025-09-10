document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const inprogressList = document.getElementById("inprogress-list");
  const completedList = document.getElementById("completed-list");
  const message = document.getElementById("message");

  // إضافة تاسك
  function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === "") return;

    const li = createTaskElement(taskText);

    // تشغيل أنيميشن دخول
    li.classList.add("task-enter");
    inprogressList.appendChild(li);
    setTimeout(() => li.classList.remove("task-enter"), 400);

    taskInput.value = "";
    showMessage("Task added successfully!");
  }

  // إنشاء عنصر تاسك
  function createTaskElement(text) {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = text;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✖";

    // دبل كليك
    li.addEventListener("dblclick", () => {
      if (li.parentElement.id === "inprogress-list") {
        li.classList.add("completed");
        completedList.appendChild(li);
        showMessage("You do well!");
      } else if (li.parentElement.id === "completed-list") {
        // أنيميشن خروج قبل المسح
        li.classList.add("task-exit");
        setTimeout(() => li.remove(), 300);
      }
    });

    // زرار X
    deleteBtn.addEventListener("click", () => {
      if (li.parentElement.id === "inprogress-list") {
        // أنيميشن خروج
        li.classList.add("task-exit");
        setTimeout(() => li.remove(), 300);
      } else {
        li.classList.remove("completed");
        inprogressList.appendChild(li);
      }
    });

    li.appendChild(span);
    li.appendChild(deleteBtn);

    return li;
  }

  // مسج نجاح
  function showMessage(text) {
    message.textContent = text;
    message.style.display = "block";
    setTimeout(() => {
      message.style.display = "none";
    }, 2000);
  }

  // زرار Add
  addTaskBtn.addEventListener("click", addTask);

  // إنتر
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  });
});
