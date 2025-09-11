document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const inprogressList = document.getElementById("inprogress-list");
  const completedList = document.getElementById("completed-list");
  const message = document.getElementById("message");
  const darkModeToggle = document.getElementById("darkModeToggle");

  const addWithBtn = document.getElementById("addWithBtn");
  const addWithMenu = document.getElementById("addWithMenu");
  const dateTimeMenu = document.getElementById("dateTimeMenu");
  const dateTimeInput = document.getElementById("dateTimeInput");
  const setDateTimeBtn = document.getElementById("setDateTimeBtn");

  let tempDateTime = null;

  // -----------------------
  // حفظ / تحميل من localStorage
  // -----------------------
  function saveTasks() {
    const inProgress = Array.from(inprogressList.children).map(li => {
      return {
        text: li.querySelector(".task-text").textContent,
        datetime: li.dataset.datetime || null
      };
    });
    const completed = Array.from(completedList.children).map(li => {
      return {
        text: li.querySelector(".task-text").textContent,
        datetime: li.dataset.datetime || null
      };
    });
    localStorage.setItem("tasks", JSON.stringify({ inProgress, completed }));
  }

  function loadTasks() {
    const saved = JSON.parse(localStorage.getItem("tasks") || "null");
    if (!saved) return;
    saved.inProgress?.forEach(obj => {
      const li = createTaskElement(obj.text, obj.datetime);
      inprogressList.appendChild(li);
    });
    saved.completed?.forEach(obj => {
      const li = createTaskElement(obj.text, obj.datetime);
      li.classList.add("completed");
      completedList.appendChild(li);
    });
  }

  // -----------------------
  // إضافة تاسك
  // -----------------------
  function addTask(text = null, datetime = null) {
    const taskText = text || taskInput.value.trim();
    if (taskText === "") return;

    if (tempDateTime && !datetime) datetime = tempDateTime;

    const li = createTaskElement(taskText, datetime);

    li.classList.add("task-enter");
    inprogressList.appendChild(li);
    setTimeout(() => li.classList.remove("task-enter"), 400);

    taskInput.value = "";
    tempDateTime = null;
    showMessage("Task added successfully!");
    saveTasks();
  }

  // -----------------------
  // إنشاء عنصر تاسك
  // -----------------------
  function createTaskElement(text, datetime = null) {
    const li = document.createElement("li");
    li.dataset.datetime = datetime || "";

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = text;

    if (datetime) {
      const dtSpan = document.createElement("span");
      dtSpan.textContent = ` ⏰ ${new Date(datetime).toLocaleString()}`;
      dtSpan.style.fontSize = "13px";
      dtSpan.style.marginLeft = "8px";
      span.appendChild(dtSpan);
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✖";

    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.textContent = "✎";

    deleteBtn.addEventListener("click", () => {
      li.remove();
      saveTasks();
    });

    editBtn.addEventListener("click", () => {
      startEdit();
    });

    function startEdit() {
      if (li.querySelector(".edit-input")) return;

      const input = document.createElement("input");
      input.type = "text";
      input.className = "edit-input";
      input.value = span.textContent;
      li.insertBefore(input, span);
      span.style.display = "none";
      input.focus();

      function commitEdit() {
        const newText = input.value.trim();
        if (newText !== "") span.textContent = newText;
        span.style.display = "";
        input.remove();
        saveTasks();
      }

      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") commitEdit();
      });
      input.addEventListener("blur", commitEdit);
    }

    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    return li;
  }

  // -----------------------
  // مسج نجاح
  // -----------------------
  function showMessage(text) {
    message.textContent = text;
    message.style.display = "block";
    message.style.opacity = "1";
    setTimeout(() => {
      message.style.opacity = "0";
      setTimeout(() => {
        message.style.display = "none";
      }, 400);
    }, 2000);
  }

  // -----------------------
  // Clear All
  // -----------------------
  function clearAll(listId) {
    const list = document.getElementById(listId);
    const items = Array.from(list.children);
    if (items.length === 0) {
      showMessage("No tasks to clear.");
      return;
    }
    items.forEach((li, idx) => {
      setTimeout(() => {
        li.remove();
        if (idx === items.length - 1) saveTasks();
      }, idx * 80);
    });
  }

  document.querySelectorAll(".clear-btn").forEach(btn => {
    btn.addEventListener("click", () => clearAll(btn.dataset.target));
  });

  // -----------------------
  // Dark Mode toggle
  // -----------------------
  function applyDarkMode(enabled) {
    document.body.classList.toggle("dark", enabled);
    darkModeToggle.textContent = enabled ? "☀️" : "🌙";
    localStorage.setItem("darkMode", enabled ? "true" : "false");
  }

  applyDarkMode(localStorage.getItem("darkMode") === "true");

  darkModeToggle.addEventListener("click", () => {
    applyDarkMode(!document.body.classList.contains("dark"));
  });

  // -----------------------
  // + Add Task With Date dropdown
  // -----------------------
  addWithBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    addWithMenu.style.display = addWithMenu.style.display === "block" ? "none" : "block";
  });

  addWithMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    addWithMenu.style.display = "none";
    dateTimeMenu.style.display = "flex";
    dateTimeInput.focus();
  });

  setDateTimeBtn.addEventListener("click", () => {
    if (!dateTimeInput.value) {
      showMessage("Please set a date & time!");
      return;
    }
    tempDateTime = dateTimeInput.value;
    dateTimeMenu.style.display = "none";
    taskInput.focus();
  });

  // Close menus on outside click
  document.addEventListener("click", () => {
    addWithMenu.style.display = "none";
    dateTimeMenu.style.display = "none";
  });

  // -----------------------
  // Add task events
  // -----------------------
  addTaskBtn.addEventListener("click", () => addTask());
  taskInput.addEventListener("keypress", (e) => { if (e.key === "Enter") addTask(); });

  loadTasks();
});
