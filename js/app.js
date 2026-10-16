/* ============================================================
   app.js — Life Dashboard
   Single JS file (Folder Rule)
   Vanilla JavaScript, no frameworks
   ============================================================ */

'use strict';

/* ── STORAGE HELPERS ─────────────────────────────────────── */

/**
 * Read a JSON value from localStorage. Returns defaultValue if key is absent.
 * @template T
 * @param {string} key
 * @param {T} defaultValue
 * @returns {T}
 */
function lsGet(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Write a JSON value to localStorage.
 * @param {string} key
 * @param {*} value
 */
function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ── THEME (Challenge: Light / Dark mode) ───────────────── */

const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon      = document.getElementById('theme-icon');

/** Apply a theme to <html> and persist it. */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  lsSet('theme', theme);
}

/** Toggle between light and dark. */
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// Init theme
applyTheme(lsGet('theme', 'light'));
themeToggleBtn.addEventListener('click', toggleTheme);

/* ── GREETING & DATE/TIME ────────────────────────────────── */

const greetingEl = document.getElementById('greeting');
const datetimeEl = document.getElementById('datetime');

const DAY_NAMES   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

/** Return a greeting prefix based on the hour. */
function getGreetingPrefix(hour) {
  if (hour >= 5  && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
}

/** Update the greeting and clock every second. */
function updateClock() {
  const now    = new Date();
  const hour   = now.getHours();
  const min    = String(now.getMinutes()).padStart(2, '0');
  const sec    = String(now.getSeconds()).padStart(2, '0');
  const name   = lsGet('userName', '');
  const suffix = name ? `, ${name}` : '';

  greetingEl.textContent = `${getGreetingPrefix(hour)}${suffix}! 👋`;
  datetimeEl.textContent =
    `${DAY_NAMES[now.getDay()]}, ${MONTH_NAMES[now.getMonth()]} ${now.getDate()} ${now.getFullYear()} — ${hour}:${min}:${sec}`;
}

updateClock();
setInterval(updateClock, 1000);

/* ── CUSTOM NAME (Challenge: Custom name in greeting) ─────── */

const setNameBtn    = document.getElementById('set-name-btn');
const nameModal     = document.getElementById('name-modal');
const nameInput     = document.getElementById('name-input');
const saveNameBtn   = document.getElementById('save-name-btn');
const cancelNameBtn = document.getElementById('cancel-name-btn');

/** Open the name modal, pre-filling with stored name. */
function openNameModal() {
  nameInput.value = lsGet('userName', '');
  nameModal.classList.remove('hidden');
  nameInput.focus();
}

/** Close the name modal without saving. */
function closeNameModal() {
  nameModal.classList.add('hidden');
}

/** Save the name and close. */
function saveName() {
  const val = nameInput.value.trim();
  lsSet('userName', val);
  closeNameModal();
  updateClock(); // refresh greeting immediately
}

setNameBtn.addEventListener('click', openNameModal);
cancelNameBtn.addEventListener('click', closeNameModal);
saveNameBtn.addEventListener('click', saveName);
nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveName(); });

// Close modal when clicking backdrop
nameModal.addEventListener('click', (e) => {
  if (e.target === nameModal) closeNameModal();
});

/* ── FOCUS TIMER ─────────────────────────────────────────── */

const timerDisplay  = document.getElementById('timer-display');
const startBtn      = document.getElementById('start-btn');
const stopBtn       = document.getElementById('stop-btn');
const resetBtn      = document.getElementById('reset-btn');
const timerStatus   = document.getElementById('timer-status');
const timerMinInput = document.getElementById('timer-minutes');
const applyTimerBtn = document.getElementById('apply-timer-btn');

let timerDurationSec = lsGet('timerMinutes', 25) * 60;
let timerRemaining   = timerDurationSec;
let timerInterval    = null;
let timerRunning     = false;

/** Format seconds as MM:SS. */
function formatTime(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Render the current remaining time. */
function renderTimer() {
  timerDisplay.textContent = formatTime(timerRemaining);
}

/** Start the countdown. */
function startTimer() {
  if (timerRunning) return;
  if (timerRemaining <= 0) return;
  timerRunning = true;
  timerStatus.textContent = 'Focus! 🔥';

  timerInterval = setInterval(() => {
    timerRemaining--;
    renderTimer();
    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerStatus.textContent = '✅ Time is up! Take a break.';
    }
  }, 1000);
}

/** Pause the countdown. */
function stopTimer() {
  if (!timerRunning) return;
  clearInterval(timerInterval);
  timerRunning = false;
  timerStatus.textContent = 'Paused ⏸';
}

/** Reset to full duration. */
function resetTimer() {
  clearInterval(timerInterval);
  timerRunning    = false;
  timerRemaining  = timerDurationSec;
  timerStatus.textContent = '';
  renderTimer();
}

/**
 * Apply a custom Pomodoro duration (Challenge: Change Pomodoro time).
 * Reads from the number input, validates, and resets the timer.
 */
function applyCustomDuration() {
  const val = parseInt(timerMinInput.value, 10);
  if (isNaN(val) || val < 1 || val > 120) {
    timerStatus.textContent = '⚠️ Enter a value between 1 and 120.';
    return;
  }
  clearInterval(timerInterval);
  timerRunning    = false;
  timerDurationSec = val * 60;
  timerRemaining   = timerDurationSec;
  lsSet('timerMinutes', val);
  timerStatus.textContent = `Timer set to ${val} min.`;
  renderTimer();
}

startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);
applyTimerBtn.addEventListener('click', applyCustomDuration);

// Sync input to stored value on load
timerMinInput.value = lsGet('timerMinutes', 25);
renderTimer();

/* ── TO-DO LIST ──────────────────────────────────────────── */

const taskInput  = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList   = document.getElementById('task-list');
const todoError  = document.getElementById('todo-error');
const todoEmpty  = document.getElementById('todo-empty');
const sortSelect = document.getElementById('sort-select');

/** @type {{ id: string, text: string, done: boolean }[]} */
let tasks = lsGet('tasks', []);

/** Generate a simple unique ID. */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** Persist tasks to localStorage. */
function saveTasks() {
  lsSet('tasks', tasks);
}

/** Show or hide the "no tasks" message. */
function updateTodoEmpty() {
  todoEmpty.classList.toggle('hidden', tasks.length > 0);
}

/**
 * Return a sorted copy of tasks based on the current sort selection.
 * Original `tasks` array is NOT mutated — sort is display-only.
 */
function getSortedTasks() {
  const mode = sortSelect.value;
  const copy = [...tasks];
  if (mode === 'az')   copy.sort((a, b) => a.text.localeCompare(b.text));
  if (mode === 'za')   copy.sort((a, b) => b.text.localeCompare(a.text));
  if (mode === 'done') copy.sort((a, b) => Number(a.done) - Number(b.done));
  return copy;
}

/** Show an inline error in the to-do section for 2.5 s. */
function showTodoError(msg) {
  todoError.textContent = msg;
  todoError.classList.remove('hidden');
  setTimeout(() => todoError.classList.add('hidden'), 2500);
}

/** Render the full task list to the DOM. */
function renderTasks() {
  taskList.innerHTML = '';
  const sorted = getSortedTasks();

  sorted.forEach((task) => {
    const li = document.createElement('li');
    li.className = `task-item${task.done ? ' task-item--done' : ''}`;
    li.dataset.id = task.id;

    // Checkbox
    const check = document.createElement('input');
    check.type      = 'checkbox';
    check.className = 'task-item__check';
    check.checked   = task.done;
    check.setAttribute('aria-label', `Mark "${task.text}" as done`);
    check.addEventListener('change', () => toggleTask(task.id));

    // Text span
    const span = document.createElement('span');
    span.className   = 'task-item__text';
    span.textContent = task.text;

    // Actions
    const actions = document.createElement('div');
    actions.className = 'task-item__actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'task-item__btn';
    editBtn.textContent = '✏️';
    editBtn.setAttribute('aria-label', `Edit "${task.text}"`);
    editBtn.title = 'Edit';
    editBtn.addEventListener('click', () => startEditTask(task.id, li, span));

    const delBtn = document.createElement('button');
    delBtn.className = 'task-item__btn';
    delBtn.textContent = '🗑️';
    delBtn.setAttribute('aria-label', `Delete "${task.text}"`);
    delBtn.title = 'Delete';
    delBtn.addEventListener('click', () => deleteTask(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(check);
    li.appendChild(span);
    li.appendChild(actions);
    taskList.appendChild(li);
  });

  updateTodoEmpty();
}

/**
 * Add a new task.
 * Challenge — Prevent duplicate tasks: case-insensitive comparison.
 */
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  // Duplicate check (Challenge: Prevent duplicate tasks)
  const isDuplicate = tasks.some(
    (t) => t.text.toLowerCase() === text.toLowerCase()
  );
  if (isDuplicate) {
    showTodoError(`⚠️ "${text}" already exists in your list.`);
    return;
  }

  tasks.push({ id: uid(), text, done: false });
  saveTasks();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
}

/** Toggle a task's done state. */
function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks();
    renderTasks();
  }
}

/** Remove a task by id. */
function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
}

/**
 * Switch a task's text span into an inline edit input.
 * @param {string} id
 * @param {HTMLLIElement} li
 * @param {HTMLSpanElement} span
 */
function startEditTask(id, li, span) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  // Replace span with an input
  const editInput = document.createElement('input');
  editInput.type      = 'text';
  editInput.className = 'task-item__edit-input';
  editInput.value     = task.text;
  editInput.maxLength = 100;
  li.replaceChild(editInput, span);
  editInput.focus();
  editInput.select();

  /** Commit the edit. */
  function commitEdit() {
    const newText = editInput.value.trim();
    if (!newText) {
      // Empty — revert
      li.replaceChild(span, editInput);
      return;
    }
    // Duplicate check (excluding self)
    const isDuplicate = tasks.some(
      (t) => t.id !== id && t.text.toLowerCase() === newText.toLowerCase()
    );
    if (isDuplicate) {
      showTodoError(`⚠️ "${newText}" already exists in your list.`);
      editInput.focus();
      return;
    }
    task.text = newText;
    saveTasks();
    renderTasks();
  }

  editInput.addEventListener('blur', commitEdit);
  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')  { editInput.blur(); }
    if (e.key === 'Escape') { li.replaceChild(span, editInput); }
  });
}

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });
sortSelect.addEventListener('change', renderTasks);

// Initial render
renderTasks();

/* ── QUICK LINKS ─────────────────────────────────────────── */

const linkNameInput = document.getElementById('link-name-input');
const linkUrlInput  = document.getElementById('link-url-input');
const addLinkBtn    = document.getElementById('add-link-btn');
const linksList     = document.getElementById('links-list');
const linksError    = document.getElementById('links-error');
const linksEmpty    = document.getElementById('links-empty');

/** @type {{ id: string, name: string, url: string }[]} */
let links = lsGet('links', []);

/** Persist links. */
function saveLinks() {
  lsSet('links', links);
}

/** Show an inline error in the quick-links section for 2.5 s. */
function showLinksError(msg) {
  linksError.textContent = msg;
  linksError.classList.remove('hidden');
  setTimeout(() => linksError.classList.add('hidden'), 2500);
}

/** Show or hide the "no links" message. */
function updateLinksEmpty() {
  linksEmpty.classList.toggle('hidden', links.length > 0);
}

/**
 * Ensure a URL has a protocol prefix so it opens as an external link.
 * @param {string} url
 * @returns {string}
 */
function normalizeUrl(url) {
  if (!/^https?:\/\//i.test(url)) return 'https://' + url;
  return url;
}

/** Render all quick-link chips. */
function renderLinks() {
  linksList.innerHTML = '';
  links.forEach((link) => {
    const item = document.createElement('div');
    item.className = 'link-item';

    const anchor = document.createElement('a');
    anchor.className = 'link-item__anchor';
    anchor.href      = link.url;
    anchor.target    = '_blank';
    anchor.rel       = 'noopener noreferrer';
    anchor.textContent = link.name;
    anchor.title     = link.url;

    const delBtn = document.createElement('button');
    delBtn.className   = 'link-item__del';
    delBtn.textContent = '✕';
    delBtn.setAttribute('aria-label', `Remove ${link.name}`);
    delBtn.addEventListener('click', () => deleteLink(link.id));

    item.appendChild(anchor);
    item.appendChild(delBtn);
    linksList.appendChild(item);
  });
  updateLinksEmpty();
}

/** Add a new quick link. */
function addLink() {
  const name = linkNameInput.value.trim();
  const rawUrl = linkUrlInput.value.trim();

  if (!name)   { showLinksError('⚠️ Please enter a label for the link.'); return; }
  if (!rawUrl) { showLinksError('⚠️ Please enter a URL.'); return; }

  const url = normalizeUrl(rawUrl);

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    showLinksError('⚠️ Invalid URL. Please include a valid address.');
    return;
  }

  links.push({ id: uid(), name, url });
  saveLinks();
  renderLinks();
  linkNameInput.value = '';
  linkUrlInput.value  = '';
  linkNameInput.focus();
}

/** Remove a link by id. */
function deleteLink(id) {
  links = links.filter((l) => l.id !== id);
  saveLinks();
  renderLinks();
}

addLinkBtn.addEventListener('click', addLink);
linkUrlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addLink(); });

// Initial render
renderLinks();
