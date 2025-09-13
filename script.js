// script.js (استبدل الملف كله بالمحتوى ده)
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
  }

  // -----------------------
  // add task
  // -----------------------
  function addTask(text = null, datetime = null) {
    const taskText = text || taskInput.value.trim();
    if (taskText === "") return;
    if (tempDateTime && !datetime) datetime = tempDateTime;

    const li = createTaskElement(taskText, datetime);
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

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (li._timer) clearInterval(li._timer);
      li.remove();
      saveTasks();
    });

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
      saveTasks();
    });

    attachDragHandlers(li);
    attachTouchHandlers(li);

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
      setTimeout(() => { message.style.display = "none"; }, 400);
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
  // Add-with: menus
  // -----------------------
  function closeMenus() {
    addWithMenu.classList.remove("visible");
    dateTimeMenu.classList.remove("visible");
  }

  plusBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    addWithMenu.classList.toggle("visible");
    dateTimeMenu.classList.remove("visible");
  });

  addWithDate.addEventListener("click", (e) => {
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

  document.addEventListener("click", () => closeMenus());

  // -----------------------
  // Add task events
  // -----------------------
  addTaskBtn.addEventListener("click", () => addTask());
  taskInput.addEventListener("keypress", (e) => { if (e.key === "Enter") addTask(); });

  loadTasks();
  initListsForDrag();
}); // end DOMContentLoaded

// -----------------------
// Drag & Drop (Desktop)
// -----------------------
function attachDragHandlers(task) {
  task.setAttribute("draggable", "true");

  task.addEventListener("dragstart", (e) => {
    setTimeout(() => task.classList.add("dragging"), 0);
    try { e.dataTransfer.setData("text/plain", "drag"); } catch {}
  });

  task.addEventListener("dragend", () => {
    task.classList.remove("dragging");
    const placeholder = document.querySelector(".placeholder");
    if (placeholder) placeholder.remove();
    if (typeof saveTasks === "function") saveTasks();
  });
}

// -----------------------
// Touch support (Mobile)
// -----------------------
function attachTouchHandlers(task) {
  let draggingElem = null;
  let originParent = null;
  let originNextSibling = null;

  task.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    originParent = task.parentElement;
    originNextSibling = task.nextSibling;

    draggingElem = task.cloneNode(true);
    draggingElem.classList.add("dragging");
    Object.assign(draggingElem.style, {
      position: "fixed",
      left: `${touch.clientX - task.offsetWidth / 2}px`,
      top: `${touch.clientY - task.offsetHeight / 2}px`,
      width: `${task.offsetWidth}px`,
      height: `${task.offsetHeight}px`,
      pointerEvents: "none",
      opacity: "0.85",
      transition: "transform 0.18s ease, opacity 0.2s ease",
      zIndex: "9999"
    });
    document.body.appendChild(draggingElem);

    task.style.visibility = "hidden";
    task.classList.add("placeholder");
  }, { passive: true });

  task.addEventListener("touchmove", (e) => {
    if (!draggingElem) return;
    const touch = e.touches[0];
    draggingElem.style.left = `${touch.clientX - task.offsetWidth / 2}px`;
    draggingElem.style.top = `${touch.clientY - task.offsetHeight / 2}px`;
  }, { passive: true });

  task.addEventListener("touchend", (e) => {
    if (!draggingElem) {
      task.style.visibility = "";
      task.classList.remove("placeholder");
      if (typeof saveTasks === "function") saveTasks();
      return;
    }

    const touch = e.changedTouches[0];
    const under = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = under?.closest(".task-list");

    if (dropZone) {
      const underTask = under?.closest(".task");
      let insertBefore = null;
      if (underTask && underTask !== task) {
        const rect = underTask.getBoundingClientRect();
        insertBefore = (touch.clientY < rect.top + rect.height / 2) ? underTask : underTask.nextSibling;
      }
      moveTaskWithAnimation(task, dropZone, insertBefore);
    } else {
      moveTaskWithAnimation(task, originParent, originNextSibling);
    }

    draggingElem.remove();
    draggingElem = null;
  }, { passive: true });
}

// -----------------------
// Move animation
// -----------------------
function moveTaskWithAnimation(task, targetList, insertBefore = null) {
  if (!task || !targetList) return;

  const startRect = task.getBoundingClientRect();
  let endRect;
  if (insertBefore && insertBefore.getBoundingClientRect) {
    endRect = insertBefore.getBoundingClientRect();
  } else {
    const firstChild = targetList.querySelector(".task");
    endRect = firstChild ? firstChild.getBoundingClientRect() : targetList.getBoundingClientRect();
  }

  const clone = task.cloneNode(true);
  Object.assign(clone.style, {
    position: "fixed",
    left: `${startRect.left}px`,
    top: `${startRect.top}px`,
    width: `${startRect.width}px`,
    height: `${startRect.height}px`,
    margin: "0",
    pointerEvents: "none",
    zIndex: "9999",
    transition: "all 200ms ease",
    boxSizing: "border-box"
  });
  document.body.appendChild(clone);

  task.style.visibility = "hidden";

  requestAnimationFrame(() => {
    clone.style.left = `${endRect.left}px`;
    clone.style.top = `${endRect.top}px`;
    clone.style.width = `${endRect.width}px`;
    clone.style.height = `${endRect.height}px`;
    clone.style.opacity = "0.95";
  });

  const cleanup = () => {
    clone.remove();
    if (insertBefore && insertBefore.parentElement === targetList) {
      targetList.insertBefore(task, insertBefore);
    } else {
      targetList.appendChild(task);
    }
    task.style.visibility = "";
    task.classList.remove("placeholder");
    if (typeof saveTasks === "function") saveTasks();
  };

  clone.addEventListener("transitionend", cleanup, { once: true });
  setTimeout(cleanup, 350);
}

// -----------------------
// Init lists
// -----------------------
function initListsForDrag() {
  const lists = document.querySelectorAll(".task-list");
  lists.forEach(list => {
    list.addEventListener("dragover", (e) => {
      e.preventDefault();
      const draggingTask = document.querySelector(".dragging");
      if (!draggingTask) return;

      const afterElement = getDragAfterElement(list, e.clientY);
      let placeholder = document.querySelector(".placeholder");
      if (!placeholder) {
        placeholder = document.createElement("div");
        placeholder.className = "placeholder";
      }
      if (afterElement == null) list.appendChild(placeholder);
      else list.insertBefore(placeholder, afterElement);
    });

    list.addEventListener("drop", (e) => {
      e.preventDefault();
      const draggingTask = document.querySelector(".dragging");
      const placeholder = document.querySelector(".placeholder");
      if (!draggingTask) return;
      moveTaskWithAnimation(draggingTask, list, placeholder || null);
      if (placeholder) placeholder.remove();
    });
  });

  document.querySelectorAll(".task").forEach(t => {
    if (!t.hasAttribute("draggable")) attachDragHandlers(t);
    attachTouchHandlers(t);
  });
}

// -----------------------
// Helper
// -----------------------
function getDragAfterElement(list, y) {
  const draggableElements = [...list.querySelectorAll(".task:not(.dragging)")];
  let closest = { offset: Number.NEGATIVE_INFINITY, element: null };
  draggableElements.forEach(child => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      closest = { offset, element: child };
    }
  });
  return closest.element;
}
