document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const inprogressList = document.getElementById("inprogress-list");
  const completedList = document.getElementById("completed-list");
  const message = document.getElementById("message");
  const darkModeToggle = document.getElementById("darkModeToggle");

  // -----------------------
  // حفظ / تحميل من localStorage
  // -----------------------
  function saveTasks() {
    const inProgress = Array.from(inprogressList.children).map(li => li.querySelector(".task-text").textContent);
    const completed = Array.from(completedList.children).map(li => li.querySelector(".task-text").textContent);
    localStorage.setItem("tasks", JSON.stringify({ inProgress, completed }));
  }

  function loadTasks() {
    const saved = JSON.parse(localStorage.getItem("tasks") || "null");
    if (!saved) return;

    // اضافة بدون مضاعفة الانيميشن غير الضروري
    saved.inProgress?.forEach(text => inprogressList.appendChild(createTaskElement(text)));
    saved.completed?.forEach(text => {
      const li = createTaskElement(text);
      li.classList.add("completed");
      completedList.appendChild(li);
    });
  }

  // -----------------------
  // إضافة تاسك
  // -----------------------
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
    saveTasks();
  }

  // -----------------------
  // إنشاء عنصر تاسك (معدل: يدعم edit on click + dblclick لحالة المكتمل)
  // -----------------------
  function createTaskElement(text) {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = text;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✖";

    // نستخدم متغير مؤقت لتفادي تعارض single click (edit) مع dblclick
    let clickTimer = null;

    // دبل كليك (نقل للمكتمل أو مسح لو انت بالفعل في المكتمل)
    li.addEventListener("dblclick", () => {
      // إلغاء أي حدث نقر ينتظر للتعديل
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
      }

      if (li.parentElement.id === "inprogress-list") {
        li.classList.add("completed");
        completedList.appendChild(li);
        showMessage("You do well!");
        saveTasks();
      } else if (li.parentElement.id === "completed-list") {
        // أنيميشن خروج قبل المسح
        li.classList.add("task-exit");
        setTimeout(() => {
          li.remove();
          saveTasks();
        }, 300);
      }
    });

    // Click on text => start edit (single click)
    span.addEventListener("click", () => {
      // ننتظر قليلًا للتأكد إنه مش dblclick
      clickTimer = setTimeout(() => {
        startEdit();
        clickTimer = null;
      }, 220);
    });

    function startEdit() {
      // لو فيه بالفعل input تحرير، متعملش تاني
      if (li.querySelector(".edit-input")) return;

      const input = document.createElement("input");
      input.type = "text";
      input.className = "edit-input";
      input.value = span.textContent;

      li.insertBefore(input, span);
      span.style.display = "none";
      input.focus();

      // حفظ التعديل عند Enter أو blur
      function commitEdit() {
        const newText = input.value.trim();
        if (newText !== "") {
          span.textContent = newText;
        }
        span.style.display = "";
        input.remove();
        saveTasks();
      }

      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          commitEdit();
        }
      });
      input.addEventListener("blur", commitEdit);
    }

    // زرار X
    deleteBtn.addEventListener("click", () => {
      if (li.parentElement.id === "inprogress-list") {
        // أنيميشن خروج
        li.classList.add("task-exit");
        setTimeout(() => {
          li.remove();
          saveTasks();
        }, 300);
      } else {
        // في المكتمل: حسب شغلك الأصلي، الزرار يعيدها للـ In Progress
        li.classList.remove("completed");
        inprogressList.appendChild(li);
        saveTasks();
      }
    });

    li.appendChild(span);
    li.appendChild(deleteBtn);

    return li;
  }

  // -----------------------
  // مسج نجاح (خفت بسيطة في الظهور بالـ opacity)
  // -----------------------
  function showMessage(text) {
    message.textContent = text;
    message.style.display = "block";
    // نفعل الـ opacity حتى يبان مع الانتقال في CSS
    message.style.opacity = "1";
    setTimeout(() => {
      message.style.opacity = "0";
      // بعد انتهاء التحول نخفيه حقيقتًا
      setTimeout(() => {
        message.style.display = "none";
      }, 400);
    }, 2000);
  }

  // -----------------------
  // زرارات Clear All
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
        li.classList.add("task-exit");
        setTimeout(() => {
          li.remove();
          // بعد آخر عنصر: احفظ واظهر مسج
          if (idx === items.length - 1) {
            saveTasks();
            showMessage("All cleared.");
          }
        }, 300);
      }, idx * 80);
    });
  }

  // ربط أزرار Clear All
  document.querySelectorAll(".clear-btn").forEach(btn => {
    btn.addEventListener("click", () => clearAll(btn.dataset.target));
  });

  // -----------------------
  // Dark Mode toggle + حفظ الاختيار
  // -----------------------
  function applyDarkMode(enabled) {
    document.body.classList.toggle("dark", enabled);
    darkModeToggle.textContent = enabled ? "☀️" : "🌙";
    localStorage.setItem("darkMode", enabled ? "true" : "false");
  }

  // تحميل حالة الداكن من localStorage
  const darkPref = localStorage.getItem("darkMode") === "true";
  applyDarkMode(darkPref);

  darkModeToggle.addEventListener("click", () => {
    const now = !document.body.classList.contains("dark");
    applyDarkMode(now);
  });

  // -----------------------
  // ربط أزرار وحدث Enter
  // -----------------------
  addTaskBtn.addEventListener("click", addTask);

  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  });

  // تحميل البيانات من localStorage عند الفتح
  loadTasks();
});
