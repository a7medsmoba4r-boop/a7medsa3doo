document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const inprogressList = document.getElementById("inprogress-list");
  const completedList = document.getElementById("completed-list");
  const message = document.getElementById("message");
  const darkModeToggle = document.getElementById("darkModeToggle");

  const plusBtn = document.getElementById("plusBtn");
  const addWithMenu = document.getElementById("addWithMenu");
  const addWithDate = document.getElementById("addWithDate");
  const dateTimeMenu = document.getElementById("dateTimeMenu");
  const dateTimeInput = document.getElementById("dateTimeInput");
  const setDateTimeBtn = document.getElementById("setDateTimeBtn");

  let tempDateTime = null;

  // -----------------------
  // Save / Load tasks
  // -----------------------
  function saveTasks() {
    const inProgress = Array.from(inprogressList.children).map(li => ({
      text: li.querySelector(".task-text").textContent,
      datetime: li.dataset.datetime || null
    }));
    const completed = Array.from(completedList.children).map(li => ({
      text: li.querySelector(".task-text").textContent,
      datetime: li.dataset.datetime || null
    }));
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
    initListsForDrag();
    sortTasksByDate(inprogressList);
    sortTasksByDate(completedList);
  }

  // -----------------------
  // Add task
  // -----------------------
  function addTask(text = null, datetime = null) {
    const taskText = text ?? taskInput.value.trim();
    if (!taskText) return;
    if (tempDateTime && !datetime) datetime = tempDateTime;

    const li = createTaskElement(taskText, datetime);
    inprogressList.insertBefore(li, inprogressList.firstChild);

    taskInput.value = "";
    tempDateTime = null;
    showMessage("Task added!");
    saveTasks();
  }

  function addTaskAndSort(text = null, datetime = null) {
    addTask(text, datetime);
    sortTasksByDate(inprogressList);
    sortTasksByDate(completedList);
  }

  // -----------------------
  // Create task element
  // -----------------------
  function createTaskElement(text, datetime = null) {
    const li = document.createElement("li");
    li.classList.add("task");
    li.dataset.datetime = datetime || "";

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = text;

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
    li.appendChild(span);

    let timer = null;
    if (datetime) {
      const badge = document.createElement("span");
      badge.className = "datetime-badge";
      li.appendChild(badge);

      function updateCountdown() {
        const now = Date.now();
        const target = new Date(datetime).getTime();
        let diff = target - now;

        if (isNaN(target)) {
          badge.textContent = "Invalid date";
          badge.classList.add("expired");
          clearInterval(timer);
          return;
        }
        if (diff <= 0) {
          badge.textContent = "⏰ Ended";
          badge.classList.add("expired");
          clearInterval(timer);
          return;
        }

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        if (diff <= 5 * 60 * 1000) badge.classList.add("soon");
        else badge.classList.remove("soon");

        if (hours > 0) badge.textContent = `${hours}h ${minutes}m`;
        else if (minutes > 0) badge.textContent = `${minutes}m ${seconds}s`;
        else badge.textContent = `${seconds}s`;
      }

      updateCountdown();
      timer = setInterval(updateCountdown, 1000);
      li._timer = timer;
    }

    li.appendChild(actions);

    deleteBtn.addEventListener("click", e => {
      e.stopPropagation();
      if (li._timer) clearInterval(li._timer);
      li.remove();
      saveTasks();
    });

    editBtn.addEventListener("click", e => {
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
        if (newText) span.textContent = newText;
        input.remove();
        span.style.display = "";
        saveTasks();
      }

      input.addEventListener("keypress", ev => { if (ev.key === "Enter") commitEdit(); });
      input.addEventListener("blur", commitEdit);
    });

    li.addEventListener("dblclick", () => {
      if (!li.classList.contains("completed")) {
        li.classList.add("completed");
        completedList.insertBefore(li, completedList.firstChild);
      } else {
        li.classList.remove("completed");
        inprogressList.insertBefore(li, inprogressList.firstChild);
      }
      sortTasksByDate(inprogressList);
      sortTasksByDate(completedList);
      saveTasks();
    });

    attachDragHandlers(li);
    attachTouchHandlers(li);

    return li;
  }

  // -----------------------
  // Message
  // -----------------------
  function showMessage(text) {
    message.textContent = text;
    message.style.display = "block";
    message.style.opacity = "1";
    setTimeout(() => {
      message.style.opacity = "0";
      setTimeout(() => { message.style.display = "none"; }, 400);
    }, 1400);
  }

  // -----------------------
  // Clear all
  // -----------------------
  function clearAll(listId) {
    const list = document.getElementById(listId);
    const items = Array.from(list.children);
    if (!items.length) {
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
  // Dark Mode
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
  // Add-with menus
  // -----------------------
  function closeMenus() {
    addWithMenu.classList.remove("visible");
    dateTimeMenu.classList.remove("visible");
  }

  plusBtn.addEventListener("click", e => {
    e.stopPropagation();
    addWithMenu.classList.toggle("visible");
    dateTimeMenu.classList.remove("visible");
  });

  addWithDate.addEventListener("click", e => {
    e.stopPropagation();
    dateTimeMenu.classList.toggle("visible");
    addWithMenu.classList.remove("visible");
    setTimeout(() => dateTimeInput.focus(), 50);
  });

  setDateTimeBtn.addEventListener("click", () => {
    if (!dateTimeInput.value) {
      showMessage("Please set a date & time!");
      return;
    }
    tempDateTime = dateTimeInput.value;
    dateTimeMenu.classList.remove("visible");
    taskInput.focus();
    showMessage("Date set ✔");
  });

  document.addEventListener("click", closeMenus);

  // -----------------------
  // Add task events
  // -----------------------
  addTaskBtn.addEventListener("click", addTaskAndSort);
  taskInput.addEventListener("keypress", e => { if (e.key === "Enter") addTaskAndSort(); });

  loadTasks();
  initListsForDrag();
});

// -----------------------
// Drag & Drop & Touch Handlers
// -----------------------
function attachDragHandlers(task) {
  task.setAttribute("draggable", "true");

  task.addEventListener("dragstart", e => {
    if (task.querySelector(".edit-input")) { e.preventDefault(); return; }
    task.classList.add("dragging");
    try { e.dataTransfer.setData("text/plain", "drag"); } catch {}
  });

  task.addEventListener("dragend", () => {
    task.classList.remove("dragging");
    document.querySelectorAll(".placeholder").forEach(p => p.remove());
    if (typeof saveTasks === "function") saveTasks();
  });
}

function attachTouchHandlers(task) {
  let startY = 0, currentY = 0, isDragging = false;
  let placeholder = null;
  let scrollY = 0;

  task.addEventListener("touchstart", e => {
    if (task.querySelector(".edit-input")) return;
    startY = e.touches[0].clientY;
    task.style.transition = "none";
  }, { passive: true });

  task.addEventListener("touchmove", e => {
    if (task.querySelector(".edit-input")) return;
    currentY = e.touches[0].clientY;
    const dy = currentY - startY;
    if (Math.abs(dy) > 5) isDragging = true;

    if (isDragging) {
      e.preventDefault(); // منع الصفحة تتحرك
      if (!placeholder) {
        placeholder = document.createElement("div");
        placeholder.className = "placeholder";
        placeholder.style.height = `${task.offsetHeight}px`;
        task.parentNode.insertBefore(placeholder, task.nextSibling);
      }
      task.style.transform = `translateY(${dy}px)`;
      task.style.opacity = "0.85";
      task.style.zIndex = "9999";
    }
  }, { passive: false });

  task.addEventListener("touchend", e => {
    if (!isDragging) return;
    task.style.transition = "transform 0.2s ease, opacity 0.2s ease";
    task.style.transform = "";
    task.style.opacity = "";
    task.style.zIndex = "";

    const touch = e.changedTouches[0];
    const under = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = under?.closest(".task-list");

    if (dropZone) {
      const allTasks = [...dropZone.querySelectorAll(".task")];
      let insertBefore = null;
      for (let t of allTasks) {
        const rect = t.getBoundingClientRect();
        if (touch.clientY < rect.top + rect.height / 2) {
          insertBefore = t;
          break;
        }
      }
      dropZone.insertBefore(task, insertBefore || null);
    }

    if (placeholder) placeholder.remove();
    placeholder = null;
    isDragging = false;
    if (typeof saveTasks === "function") saveTasks();
  }, { passive: false });
}

function initListsForDrag() {
  const lists = document.querySelectorAll(".task-list");
  lists.forEach(list => {
    list.addEventListener("dragover", e => {
      e.preventDefault();
      const draggingTask = document.querySelector(".dragging");
      if (!draggingTask) return;

      const afterElement = getDragAfterElement(list, e.clientY);
      let placeholder = document.querySelector(".placeholder");
      if (!placeholder) {
        placeholder = document.createElement("div");
        placeholder.className = "placeholder";
        placeholder.style.height = `${draggingTask.offsetHeight}px`;
        placeholder.style.marginBottom = "10px";
      }
      if (afterElement == null) list.appendChild(placeholder);
      else list.insertBefore(placeholder, afterElement);
    });

    list.addEventListener("drop", e => {
      e.preventDefault();
      const draggingTask = document.querySelector(".dragging");
      const placeholder = document.querySelector(".placeholder");
      if (!draggingTask) return;
      if (placeholder) list.insertBefore(draggingTask, placeholder);
      draggingTask.classList.remove("dragging");
      if (typeof saveTasks === "function") saveTasks();
    });
  });

  document.querySelectorAll(".task").forEach(t => {
    if (!t.hasAttribute("draggable")) attachDragHandlers(t);
    attachTouchHandlers(t);
  });
}

function getDragAfterElement(list, y) {
  const draggableElements = [...list.querySelectorAll(".task:not(.dragging)")];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    else return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function sortTasksByDate(list) {
  const tasks = Array.from(list.querySelectorAll(".task"));
  tasks.sort((a, b) => {
    const dateA = a.dataset.datetime ? new Date(a.dataset.datetime).getTime() : Infinity;
    const dateB = b.dataset.datetime ? new Date(b.dataset.datetime).getTime() : Infinity;
    return dateA - dateB;
  });
  tasks.forEach(t => list.appendChild(t));
}
