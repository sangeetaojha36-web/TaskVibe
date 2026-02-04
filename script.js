// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

let currentTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon(currentTheme);
});

function updateThemeIcon(theme) {
    themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
}

// Live Clock Update
function updateClock() {
    const now = new Date();

    // Time (24-hour format for consistency)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clockTime').textContent = `${hours}:${minutes}:${seconds}`;

    // Date
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    document.getElementById('clockDate').textContent = now.toLocaleDateString('en-US', options);
}

// Update clock every second
updateClock();
setInterval(updateClock, 1000);

// Navigation Menu Toggle (Mobile)
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Page Navigation - OPTIMIZED for instant response
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        const targetPage = link.getAttribute('data-page');

        // Instant UI feedback
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Instant page switch
        pages.forEach(p => p.classList.remove('active'));
        document.getElementById(targetPage).classList.add('active');

        // Close mobile menu
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');

        // Load content after page is visible (non-blocking)
        if (targetPage === 'all-tasks') {
            setTimeout(() => renderAllTasks(), 0);
        } else if (targetPage === 'alarms') {
            setTimeout(() => renderAlarms(), 0);
        }
    });
});

// Tab Switching (Dashboard)
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');

        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(`${targetTab}-content`).classList.add('active');
    });
});

// Task Management
const emojis = ['🎯', '💪', '🔥', '⚡', '🌟', '🎨', '📚', '💡', '🚀', '🎪', '🌈', '🦄', '🎭', '🎬', '🎮', '🏆', '💎', '🎸', '🎤', '🎧'];

function getRandomEmoji() {
    return emojis[Math.floor(Math.random() * emojis.length)];
}

// Load tasks from localStorage
function loadTasks(type) {
    const tasks = localStorage.getItem(`tasks-${type}`);
    return tasks ? JSON.parse(tasks) : [];
}

// Save tasks to localStorage
function saveTasks(type, tasks) {
    localStorage.setItem(`tasks-${type}`, JSON.stringify(tasks));
}

// Add Task
function addTask(type) {
    const input = document.getElementById(`${type}-input`);
    const text = input.value.trim();

    if (!text) {
        input.style.borderColor = '#ff6b6b';
        setTimeout(() => {
            input.style.borderColor = '';
        }, 500);
        return;
    }

    const tasks = loadTasks(type);
    const task = {
        id: Date.now(),
        text: text,
        emoji: getRandomEmoji(),
        completed: false,
        date: type === 'datewise' ? document.getElementById('date-picker').value : null
    };

    tasks.push(task);
    saveTasks(type, tasks);

    input.value = '';
    renderTasks(type);
    updateStats(type);
}

// Render Tasks
function renderTasks(type, filterDate = null) {
    const list = document.getElementById(`${type}-list`);
    let tasks = loadTasks(type);

    if (type === 'datewise' && filterDate) {
        tasks = tasks.filter(t => t.date === filterDate);
    }

    list.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                   onchange="toggleTask('${type}', ${task.id})">
            <div class="task-text">
                <span class="task-emoji">${task.emoji}</span>
                <span>${task.text}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask('${type}', ${task.id})">
                Delete 🗑️
            </button>
        `;
        list.appendChild(li);
    });

    updateStats(type);
}

// Toggle Task Completion
function toggleTask(type, id) {
    const tasks = loadTasks(type);
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks(type, tasks);
        renderTasks(type, type === 'datewise' ? document.getElementById('date-picker').value : null);

        // Refresh all tasks page if it's visible
        const allTasksPage = document.getElementById('all-tasks');
        if (allTasksPage.classList.contains('active')) {
            renderAllTasks();
        }
    }
}

// Delete Task
function deleteTask(type, id) {
    let tasks = loadTasks(type);
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(type, tasks);
    renderTasks(type, type === 'datewise' ? document.getElementById('date-picker').value : null);

    // Refresh all tasks page if it's visible
    const allTasksPage = document.getElementById('all-tasks');
    if (allTasksPage.classList.contains('active')) {
        renderAllTasks();
    }
}

// Update Stats
function updateStats(type) {
    const tasks = loadTasks(type);
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    document.getElementById(`${type}-total`).textContent = total;
    document.getElementById(`${type}-completed`).textContent = completed;
    document.getElementById(`${type}-pending`).textContent = pending;
}

// Render All Tasks (All Tasks Page)
function renderAllTasks() {
    ['daily', 'weekly', 'monthly', 'datewise'].forEach(type => {
                const list = document.getElementById(`all-${type}-list`);
                const tasks = loadTasks(type);

                list.innerHTML = '';

                if (tasks.length === 0) {
                    list.innerHTML = '<li style="padding: 20px; text-align: center; color: var(--text-secondary-light);">No tasks yet 📝</li>';
                    return;
                }

                tasks.forEach(task => {
                            const li = document.createElement('li');
                            li.className = `task-item ${task.completed ? 'completed' : ''}`;
                            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="toggleTask('${type}', ${task.id})">
                <div class="task-text">
                    <span class="task-emoji">${task.emoji}</span>
                    <span>${task.text}</span>
                    ${task.date ? `<small style="opacity: 0.7;"> (${task.date})</small>` : ''}
                </div>
                <button class="delete-btn" onclick="deleteTask('${type}', ${task.id})">
                    Delete 🗑️
                </button>
            `;
            list.appendChild(li);
        });
    });
}

// Enter key support for all inputs
['daily', 'weekly', 'monthly', 'datewise'].forEach(type => {
    const input = document.getElementById(`${type}-input`);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask(type);
        }
    });
});

// Date Picker
const datePicker = document.getElementById('date-picker');
const dateDisplay = document.getElementById('date-display');

datePicker.valueAsDate = new Date();
updateDateDisplay();
renderTasks('datewise', datePicker.value);

datePicker.addEventListener('change', () => {
    updateDateDisplay();
    renderTasks('datewise', datePicker.value);
});

function updateDateDisplay() {
    const date = new Date(datePicker.value);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = `📅 ${date.toLocaleDateString('en-US', options)}`;
}

// Initialize all tasks
['daily', 'weekly', 'monthly'].forEach(type => {
    renderTasks(type);
});

// ===== ALARM CLOCK FUNCTIONALITY WITH CONTINUOUS RINGING =====

let alarmCheckInterval;
let currentAlarmSound = null; // Track current alarm sound interval
let currentAlarmId = null; // Track which alarm is currently ringing

// Load alarms from localStorage
function loadAlarms() {
    const alarms = localStorage.getItem('alarms');
    return alarms ? JSON.parse(alarms) : [];
}

// Save alarms to localStorage
function saveAlarms(alarms) {
    localStorage.setItem('alarms', JSON.stringify(alarms));
}

// Convert 12-hour time to 24-hour format
function convertTo24Hour(hour, minute, period) {
    let hour24 = parseInt(hour);

    if (period === 'PM' && hour24 !== 12) {
        hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
        hour24 = 0;
    }

    return `${String(hour24).padStart(2, '0')}:${minute}`;
}

// Set Alarm with AM/PM
function setAlarm() {
    const hourSelect = document.getElementById('alarm-hour');
    const minuteSelect = document.getElementById('alarm-minute');
    const periodSelect = document.getElementById('alarm-period');
    const noteInput = document.getElementById('alarm-note');

    const hour = hourSelect.value;
    const minute = minuteSelect.value;
    const period = periodSelect.value;
    const note = noteInput.value.trim();

    if (!note) {
        noteInput.style.borderColor = '#ff6b6b';
        setTimeout(() => {
            noteInput.style.borderColor = '';
        }, 500);
        return;
    }

    // Convert to 24-hour format for storage
    const time24 = convertTo24Hour(hour, minute, period);

    const alarms = loadAlarms();
    const alarm = {
        id: Date.now(),
        time: time24,
        displayTime: `${hour}:${minute} ${period}`,
        note: note,
        active: true,
        triggered: false
    };

    alarms.push(alarm);
    saveAlarms(alarms);

    noteInput.value = '';

    renderAlarms();

    // Show success notification
    showNotification(`⏰ Alarm set for ${hour}:${minute} ${period}!`);
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, var(--green), var(--blue));
        color: white;
        padding: 20px 30px;
        border-radius: 20px;
        font-family: Poppins, sans-serif;
        font-size: 1.1rem;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.4s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease-out';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Render Alarms
function renderAlarms() {
    const alarmsList = document.getElementById('alarms-list');
    const alarms = loadAlarms();

    alarmsList.innerHTML = '';

    if (alarms.length === 0) {
        alarmsList.innerHTML = '<li style="padding: 30px; text-align: center; color: var(--text-secondary-light); font-size: 1.2rem;">No alarms set yet ⏰</li>';
        return;
    }

    alarms.forEach(alarm => {
        const li = document.createElement('li');
        li.className = 'alarm-item';
        li.innerHTML = `
            <div class="alarm-info">
                <div class="alarm-time-display">⏰ ${alarm.displayTime}</div>
                <div class="alarm-note-display">📝 ${alarm.note}</div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <span class="alarm-status ${alarm.active ? 'active' : 'inactive'}">
                    ${alarm.active ? '🔔 Active' : '🔕 Inactive'}
                </span>
                <button class="delete-btn" style="opacity: 1; transform: translateX(0);" onclick="deleteAlarm(${alarm.id})">
                    Delete 🗑️
                </button>
            </div>
        `;
        alarmsList.appendChild(li);
    });
}

// Delete Alarm
function deleteAlarm(id) {
    let alarms = loadAlarms();
    alarms = alarms.filter(a => a.id !== id);
    saveAlarms(alarms);
    renderAlarms();
    showNotification('🗑️ Alarm deleted!');
}

// Check Alarms Every Second
function checkAlarms() {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const alarms = loadAlarms();
    let alarmsUpdated = false;

    alarms.forEach(alarm => {
        if (alarm.active && !alarm.triggered && alarm.time === currentTime) {
            // Trigger alarm
            triggerAlarm(alarm);
            alarm.triggered = true;
            alarmsUpdated = true;

            // Reset triggered status after 1 minute
            setTimeout(() => {
                const updatedAlarms = loadAlarms();
                const currentAlarm = updatedAlarms.find(a => a.id === alarm.id);
                if (currentAlarm) {
                    currentAlarm.triggered = false;
                    saveAlarms(updatedAlarms);
                }
            }, 60000);
        }
    });

    if (alarmsUpdated) {
        saveAlarms(alarms);
        renderAlarms();
    }
}

// Trigger Alarm (Show Modal and Start Continuous Sound)
function triggerAlarm(alarm) {
    const modal = document.getElementById('alarmModal');
    const message = document.getElementById('alarmMessage');

    message.textContent = alarm.note;
    modal.classList.add('show');

    // Store current alarm ID
    currentAlarmId = alarm.id;

    // Start continuous alarm sound
    startContinuousAlarmSound();
}

// Dismiss Alarm - Stop sound and auto-delete
function dismissAlarm() {
    const modal = document.getElementById('alarmModal');
    modal.classList.remove('show');

    // Stop alarm sound
    stopAlarmSound();

    // Auto-delete the alarm from list
    if (currentAlarmId !== null) {
        let alarms = loadAlarms();
        alarms = alarms.filter(a => a.id !== currentAlarmId);
        saveAlarms(alarms);
        renderAlarms();

        showNotification('✅ Alarm dismissed and deleted!');

        currentAlarmId = null;
    }
}

// Start Continuous Alarm Sound
function startContinuousAlarmSound() {
    // Stop any existing alarm sound
    stopAlarmSound();

    // Play alarm sound repeatedly every 2 seconds
    currentAlarmSound = setInterval(() => {
        playAlarmBeep();
    }, 2000);

    // Play immediately first time
    playAlarmBeep();
}

// Stop Alarm Sound
function stopAlarmSound() {
    if (currentAlarmSound !== null) {
        clearInterval(currentAlarmSound);
        currentAlarmSound = null;
    }
}

// Play Single Alarm Beep
function playAlarmBeep() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Play 3 quick beeps
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = 880; // Higher pitch for urgency
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            }, i * 400);
        }
    } catch (error) {
        console.log('Audio not supported');
    }
}

// Start alarm checking
alarmCheckInterval = setInterval(checkAlarms, 1000);

// Initialize alarms when page loads
renderAlarms();

// Enter key support for alarm inputs
document.getElementById('alarm-note').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        setAlarm();
    }
});