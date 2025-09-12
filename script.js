document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const inprogressList = document.getElementById("inprogress-list");
  const completedList = document.getElementById("completed-list");
  const message = document.getElementById("message");
  const darkModeToggle = document.getElementById("darkModeToggle");

  // add-with elements
  const plusBtn = document.getElementById("plusBtn");
  const addWithMenu = document.getElementById("addWithMenu");
  const addWithDate = document.getElementById("addWithDate");
  const dateTimeMenu = document.getElementById("dateTimeMenu");
  const dateTimeInput = document.getElementById("dateTimeInput");
  const setDateTimeBtn = document.getElementById("setDateTimeBtn");

  let tempDateTime = null;

  // -----------------------
  // save/load tasks
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
  // add task
  // -----------------------
  function addTask(text = null, datetime = null) {
    const taskText = text || taskInput.value.trim();
    if (taskText === "") return;

    if (tempDateTime && !datetime) datetime = tempDateTime;

    const li = createTaskElement(taskText, datetime);
    // insert at top
    inprogressList.insertBefore(li, inprogressList.firstChild);

    taskInput.value = "";
    tempDateTime = null;
    showMessage("Task added!");
    saveTasks();
  }

  // -----------------------
  // create task element
  // -----------------------
  function createTaskElement(text, datetime = null) {
    const li = document.createElement("li");
    li.dataset.datetime = datetime || "";

    // main text
    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = text;

    // actions (edit / delete)
    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.textContent = "✎";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✖";

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    // append text first
    li.appendChild(span);

    // if there's a datetime -> create badge and place BEFORE actions
    let timer = null;
    if (datetime) {
      const badge = document.createElement("span");
      badge.className = "datetime-badge";
      li.appendChild(badge); // placed after text

      function updateCountdown() {
        const now = Date.now();
        const target = new Date(datetime).getTime();
        let diff = target - now;

        if (isNaN(target)) {
          badge.textContent = "Invalid date";
          badge.classList.add("expired");
          if (timer) clearInterval(timer);
          return;
        }

        if (diff <= 0) {
          badge.textContent = "⏰ Ended";
          badge.classList.remove("soon");
          badge.classList.add("expired");
          clearInterval(timer);
          return;
        }

        // compute H M S
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // style near end (< 5 minutes)
        if (diff <= 5 * 60 * 1000) {
          badge.classList.add("soon");
        } else {
          badge.classList.remove("soon");
        }

        if (hours > 0) {
          badge.textContent = `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
          badge.textContent = `${minutes}m ${seconds}s`;
        } else {
          badge.textContent = `${seconds}s`;
        }
      }

      updateCountdown();
      timer = setInterval(updateCountdown, 1000);
      // keep ref so we can clear when deleting
      li._timer = timer;
    }

    // append actions to li (after badge)
    li.appendChild(actions);

    // delete
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (li._timer) clearInterval(li._timer);
      li.remove();
      saveTasks();
    });

    // edit inline
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
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
        input.remove();
        span.style.display = "";
        saveTasks();
      }

      input.addEventListener("keypress", (ev) => {
        if (ev.key === "Enter") commitEdit();
      });
      input.addEventListener("blur", commitEdit);
    });

    // double click to toggle complete (keeps datetime)
    li.addEventListener("dblclick", () => {
      if (!li.classList.contains("completed")) {
        li.classList.add("completed");
        completedList.insertBefore(li, completedList.firstChild);
      } else {
        li.classList.remove("completed");
        inprogressList.insertBefore(li, inprogressList.firstChild);
      }
      saveTasks();
    });

    return li;
  }

  // -----------------------
  // message
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
    }, 1400);
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
      if (li._timer) clearInterval(li._timer);
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
  // Add-with: menu behavior (plus text toggles small menu above it)
  // -----------------------
  function closeMenus() {
    addWithMenu.classList.remove("visible");
    dateTimeMenu.classList.remove("visible");
    addWithMenu.setAttribute("aria-hidden", "true");
    dateTimeMenu.setAttribute("aria-hidden", "true");
  }

  plusBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    addWithMenu.classList.toggle("visible");
    dateTimeMenu.classList.remove("visible");
    addWithMenu.setAttribute("aria-hidden", addWithMenu.classList.contains("visible") ? "false" : "true");
    dateTimeMenu.setAttribute("aria-hidden", "true");
  });

  addWithDate.addEventListener("click", (e) => {
    e.stopPropagation();
    dateTimeMenu.classList.toggle("visible");
    addWithMenu.classList.remove("visible");
    dateTimeMenu.setAttribute("aria-hidden", dateTimeMenu.classList.contains("visible") ? "false" : "true");
    addWithMenu.setAttribute("aria-hidden", "true");
    setTimeout(() => dateTimeInput.focus(), 50);
  });

  addWithMenu.addEventListener("click", (e) => e.stopPropagation());
  dateTimeMenu.addEventListener("click", (e) => e.stopPropagation());

  setDateTimeBtn.addEventListener("click", () => {
    if (!dateTimeInput.value) {
      showMessage("Please set a date & time!");
      return;
    }
    tempDateTime = dateTimeInput.value;
    dateTimeMenu.classList.remove("visible");
    dateTimeMenu.setAttribute("aria-hidden", "true");
    taskInput.focus();
    showMessage("Date set ✔");
  });

  // Close menus on outside click
  document.addEventListener("click", () => closeMenus());

  // -----------------------
  // Add task events (button + Enter)
  // -----------------------
  addTaskBtn.addEventListener("click", () => addTask());
  taskInput.addEventListener("keypress", (e) => { if (e.key === "Enter") addTask(); });

  // load existing
  loadTasks();
});
