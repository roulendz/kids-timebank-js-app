/**
 * @typedef {Object} Activity
 * @property {string} id - Unique identifier
 * @property {string} description - Activity description
 * @property {string} type - Activity type (work/recreational)
 * @property {number} startTime - Timestamp when activity started
 * @property {number} endTime - Timestamp when activity ended
 * @property {number} duration - Duration in seconds
 * @property {string} userId - User ID who performed the activity
 */

/**
 * @typedef {Object} User
 * @property {string} id - Unique identifier
 * @property {string} name - User name
 * @property {number} recreationalBalance - Available recreational time in seconds
 */

/**
 * @typedef {Object} AppState
 * @property {Activity[]} activities
 * @property {User[]} users
 * @property {string|null} currentUserId
 * @property {Activity|null} currentActivity
 */

// Initial state with some sample data
const initialState = {
    activities: [],
    users: [
        { id: '1', name: 'Kid 1', recreationalBalance: 0 },
        { id: '2', name: 'Kid 2', recreationalBalance: 0 }
    ],
    currentUserId: null,
    currentActivity: null
};

class ActivityTracker {
    constructor() {
        this.loadState();
        this.initializeUI();
        this.bindEvents();
    }

    /**
     * Load state from localStorage or use initial state
     */
    loadState() {
        const savedState = localStorage.getItem('activityTrackerState');
        this.state = savedState ? JSON.parse(savedState) : initialState;
    }

    /**
     * Save current state to localStorage
     */
    saveState() {
        localStorage.setItem('activityTrackerState', JSON.stringify(this.state));
    }

    /**
     * Initialize UI elements
     */
    initializeUI() {
        document.body.innerHTML = `
            <div class="container mx-auto p-4 max-w-3xl">
                <h1 class="text-3xl font-bold mb-6">Activity Tracker</h1>
                
                <!-- User Selection -->
                <div class="mb-6">
                    <label class="block text-sm font-medium mb-2">Select User</label>
                    <select id="userSelect" class="w-full p-2 border rounded">
                        <option value="">Select a user...</option>
                        ${this.state.users.map(user => 
                            `<option value="${user.id}">${user.name}</option>`
                        ).join('')}
                    </select>
                </div>

                <!-- Activity Timer -->
                <div id="timerSection" class="mb-6 hidden">
                    <div class="bg-white p-4 rounded-lg shadow">
                        <h2 class="text-xl font-semibold mb-4">Activity Timer</h2>
                        <select id="activityType" class="w-full p-2 border rounded mb-4">
                            <option value="work">Work/Study</option>
                            <option value="recreational">Recreational</option>
                        </select>
                        <input type="text" id="activityDescription" placeholder="Activity Description" 
                               class="w-full p-2 border rounded mb-4">
                        <div id="timer" class="text-2xl font-mono text-center mb-4">00:00:00</div>
                        <div class="flex gap-2">
                            <button id="startBtn" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                                Start
                            </button>
                            <button id="stopBtn" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 hidden">
                                Stop
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Recreational Balance -->
                <div id="balanceSection" class="mb-6 hidden">
                    <div class="bg-white p-4 rounded-lg shadow">
                        <h2 class="text-xl font-semibold mb-2">Recreational Time Balance</h2>
                        <div id="balance" class="text-2xl font-mono">00:00:00</div>
                    </div>
                </div>

                <!-- Activity Log -->
                <div id="activityLog" class="bg-white p-4 rounded-lg shadow">
                    <h2 class="text-xl font-semibold mb-4">Activity Log</h2>
                    <div id="logEntries"></div>
                </div>
            </div>
        `;
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        document.getElementById('userSelect').addEventListener('change', (e) => {
            this.state.currentUserId = e.target.value;
            this.updateUI();
            this.saveState();
        });

        document.getElementById('startBtn').addEventListener('click', () => this.startActivity());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopActivity());
    }

    /**
     * Start tracking a new activity
     */
    startActivity() {
        const type = document.getElementById('activityType').value;
        const description = document.getElementById('activityDescription').value;

        this.state.currentActivity = {
            id: Date.now().toString(),
            type,
            description,
            startTime: Date.now(),
            endTime: null,
            duration: 0,
            userId: this.state.currentUserId
        };

        document.getElementById('startBtn').classList.add('hidden');
        document.getElementById('stopBtn').classList.remove('hidden');
        
        this.startTimer();
    }

    /**
     * Stop tracking the current activity
     */
    stopActivity() {
        if (!this.state.currentActivity) return;

        const activity = this.state.currentActivity;
        activity.endTime = Date.now();
        activity.duration = Math.floor((activity.endTime - activity.startTime) / 1000);

        this.state.activities.push(activity);
        
        if (activity.type === 'work') {
            const user = this.state.users.find(u => u.id === this.state.currentUserId);
            if (user) {
                user.recreationalBalance += activity.duration;
            }
        } else if (activity.type === 'recreational') {
            const user = this.state.users.find(u => u.id === this.state.currentUserId);
            if (user) {
                user.recreationalBalance = Math.max(0, user.recreationalBalance - activity.duration);
            }
        }

        this.state.currentActivity = null;
        clearInterval(this.timerInterval);
        
        document.getElementById('startBtn').classList.remove('hidden');
        document.getElementById('stopBtn').classList.add('hidden');
        document.getElementById('timer').textContent = '00:00:00';
        
        this.saveState();
        this.updateUI();
    }

    /**
     * Start the timer display
     */
    startTimer() {
        this.timerInterval = setInterval(() => {
            const duration = Math.floor((Date.now() - this.state.currentActivity.startTime) / 1000);
            document.getElementById('timer').textContent = this.formatTime(duration);
        }, 1000);
    }

    /**
     * Update the UI elements
     */
    updateUI() {
        const timerSection = document.getElementById('timerSection');
        const balanceSection = document.getElementById('balanceSection');
        
        if (this.state.currentUserId) {
            timerSection.classList.remove('hidden');
            balanceSection.classList.remove('hidden');
            
            const user = this.state.users.find(u => u.id === this.state.currentUserId);
            document.getElementById('balance').textContent = this.formatTime(user.recreationalBalance);
            
            this.updateActivityLog();
        } else {
            timerSection.classList.add('hidden');
            balanceSection.classList.add('hidden');
        }
    }

    /**
     * Update the activity log display
     */
    updateActivityLog() {
        const logEntries = document.getElementById('logEntries');
        const userActivities = this.state.activities
            .filter(activity => activity.userId === this.state.currentUserId)
            .sort((a, b) => b.startTime - a.startTime);

        logEntries.innerHTML = userActivities.map(activity => `
            <div class="border-b py-2">
                <div class="font-semibold">${activity.description}</div>
                <div class="text-sm text-gray-600">
                    Type: ${activity.type}
                    | Duration: ${this.formatTime(activity.duration)}
                    | Date: ${new Date(activity.startTime).toLocaleDateString()}
                </div>
            </div>
        `).join('');
    }

    /**
     * Format seconds into HH:MM:SS
     * @param {number} seconds
     * @returns {string}
     */
    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
}

// Initialize the application
const app = new ActivityTracker();