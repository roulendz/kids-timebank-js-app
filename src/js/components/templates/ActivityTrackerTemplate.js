/**
 * @file src/js/components/templates/ActivityTrackerTemplate.js
 * @typedef {import('../../types/Types').TimeTrackingState} TimeTrackingState
 * Creates the activity tracker page layout
 * @returns {HTMLElement} The main container element
 */

import { DateTimeUtils } from '../../utils/DateTimeUtils.js';
import { TimerAnimationService } from '../../services/TimerAnimationService.js';
import { WalletCalculationService } from '../../services/WalletCalculationService.js';
import { TimeTrackingService } from '../../services/TimeTrackingService.js';
import { stateManager } from '../../services/StateManager.js';

export class ActivityTrackerTemplate {

    constructor(sUserId) {
        this.timerAnimationService = new TimerAnimationService();
        this.walletCalculationService = new WalletCalculationService();
        this.timeTrackingService = new TimeTrackingService(sUserId);
        this.timerInterval = null;
        this.sUserId = sUserId; // Add this line
    }

    /**
     * Creates the activity tracker page layout
     * @param {Array} activities - Array of today's activities
     * @returns {HTMLElement} The main container element
     */
    createLayout(activities = []) {
        const container = document.createElement('div');
        container.className = 'grid grid-cols-2 grid-rows-2 gap-4 h-screen p-4 overflow-hidden';
    
        const leftColumn = this._createLeftColumn();
        const rightColumn = this._createRightColumn();
    
        container.appendChild(leftColumn);
        container.appendChild(rightColumn);
    
        // Initialize after DOM elements are added
        requestAnimationFrame(() => {
            this._initializeTimerUpdates(activities);
            this._updateTotalAvailableTime(activities);
        });
    
        return container;
    }

    /**
     * Initialize timer update intervals and event listeners
     * @private
     */
    _initializeTimerUpdates(activities = []) {
        // Clear any existing interval
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        // Calculate and display initial total
        this._updateTotalAvailableTime(activities);

        const startBtn = document.getElementById('startTracking');
        const stopBtn = document.getElementById('stopTracking');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.timeTrackingService.startTracking();
                this._startTimerUpdates();
                this._toggleTimerVisibility(true);
            });
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', async () => {
                this._stopTimerUpdates();
                await this._handleStopTracking();
            });
        }
    }

    /**
     * Updates the total available time display
     * @param {Array} activities - Array of today's activities
     * @private
     */
    _updateTotalAvailableTime(activities = []) {
        const totalTimeElement = document.getElementById('todayTotalTimeLeft');
        if (!totalTimeElement) {
            console.warn('todayTotalTimeLeft element not found');
            return;
        }

        const totalAvailableMs = this.walletCalculationService.calculateTotalAvailableTime(activities);
        console.log('Total available milliseconds to display:', totalAvailableMs);
        
        const formattedTime = DateTimeUtils.formatDuration(totalAvailableMs);
        console.log('Formatted time to display:', formattedTime);
        
        // Update both displays
        totalTimeElement.textContent = formattedTime;
        
        // Also update the activities total in the left column
        const activitiesTotalElement = document.getElementById('todayActivitiesTotal');
        if (activitiesTotalElement) {
            activitiesTotalElement.textContent = formattedTime;
        }

        console.log('Updated display values:', {
            totalTimeElement: totalTimeElement.textContent,
            activitiesTotal: activitiesTotalElement?.textContent
        });
    }

    /**
     * Start timer update interval
     * @private
     */
    _startTimerUpdates() {
        const timerElement = document.getElementById('timer');
        let startTime = Date.now();

        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const formattedTime = DateTimeUtils.formatDuration(elapsed);
            
            if (timerElement) {
                timerElement.textContent = formattedTime;
            }
        }, 1000);
    }

    /**
     * Stop timer updates and clear interval
     * @private
     * @returns {Promise<void>}
     */
    async _stopTimerUpdates() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Handle stop tracking button click
     * @private
     */
    async _handleStopTracking() {
        const timerElement = document.getElementById('timer');
        const finalTime = timerElement.textContent;

        // Add activity to state manager
        const newActivity = this.timeTrackingService.stopTracking('Activity');
        await stateManager.addActivity(newActivity);

        // Get updated activities
        const activities = await stateManager.getActivities(this.sUserId);
        const todayActivities = activities.filter(activity => {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            return activity.nStartTime >= todayStart.getTime();
        });
        
        // Update total available time
        this._updateTotalAvailableTime(todayActivities);

        // Animate timer value floating to wallet
        await this.timerAnimationService.animateTimerToWallet();

        this._toggleTimerVisibility(false);
    }

    /**
     * Creates the left column with activity tracking
     * @returns {HTMLElement}
     * @private
     */
    _createLeftColumn() {
        const leftColumn = document.createElement('div');
        leftColumn.className = 'col-span-1 row-span-2 flex flex-col gap-4 h-full';

        // Activity Tracker Section
        const trackerSection = document.createElement('div');
        trackerSection.className = 'flex-1 bg-white rounded-lg shadow-lg p-6 h-1/2';
        trackerSection.innerHTML = `
            <div id="activityTracker" class="h-full flex flex-col">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold">Start Activity</h2>
                    <div id="todayActivitiesTotal" class="text-2xl font-bold">00:00:00</div>
                </div>
                <div id="startButtonContainer" class="flex-1 flex items-center justify-center">
                    <button 
                        data-action="start-tracking" 
                        id="startTracking"
                        class="w-64 h-64 bg-green-500 hover:bg-green-600 text-white rounded-3xl shadow-lg transform transition-all duration-300 flex flex-col items-center justify-center">
                        <span class="text-4xl font-bold mb-2">START</span>
                        <span class="text-sm">DEPOSITING ACTIVITY TIME</span>
                    </button>
                </div>
                <div id="timerContainer" class="hidden h-full">
                    <div class="h-full flex flex-col items-center justify-center">
                        <div id="timer" class="text-6xl font-bold mb-8">00:00:00</div>
                        <button 
                            data-action="stop-tracking"
                            id="stopTracking" 
                            class="w-48 h-48 bg-red-500 hover:bg-red-600 text-white rounded-3xl shadow-lg flex flex-col items-center justify-center">
                            <span class="text-2xl font-bold mb-2">STOP</span>
                            <span class="text-sm text-center">ACTIVITY AND<br>DEPOSIT TO MY BANK</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add Today's Activities List Section
        const activitiesSection = document.createElement('div');
        activitiesSection.className = 'flex-1 bg-white rounded-lg shadow-lg p-6 h-1/2';
        activitiesSection.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">Today's Activities</h2>
                <divclass="text-2xl font-bold"></div>
            </div>
            <div id="activitiesList" class="h-[calc(100%-3rem)] overflow-y-auto">
                <!-- Today's wallet content will be inserted here -->
            </div>
        `;

        leftColumn.appendChild(trackerSection);
        leftColumn.appendChild(activitiesSection);

        return leftColumn;
    }

    /**
     * Creates the right column with wallet information
     * @returns {HTMLElement}
     * @private
     */
    _createRightColumn() {
        const rightColumn = document.createElement('div');
        rightColumn.className = 'col-span-1 row-span-2 flex flex-col gap-4 h-full';

        // Today's Wallet Section
        const todayWallet = document.createElement('div');
        todayWallet.id = 'todayWalletPanel';
        todayWallet.className = 'flex-1 bg-white rounded-lg shadow-lg p-6 h-1/2';
        todayWallet.innerHTML = `
        <div id="timeUsageTracker" class="h-full flex flex-col">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">Today's Wallet Earned Time </h2>
                <div id="todayTotalTimeLeft" class="text-2xl font-bold">00:00:00</div>
            </div>
            <div id="startUsageContainer" class="flex-1 flex items-center justify-center">
                <button 
                    data-action="start-usage" 
                    id="startTimeUsage"
                    class="w-64 h-64 bg-yellow-200 hover:bg-yellow-300 text-gray-800 rounded-3xl shadow-lg transform transition-all duration-300 flex flex-col items-center justify-center">
                    <span class="text-4xl font-bold mb-2">USE</span>
                    <span class="text-sm">MY TIME</span>
                </button>
            </div>
            <div id="usageTimerContainer" class="hidden h-full">
                <div class="h-full flex flex-col items-center justify-center">
                    <div id="usageTimer" class="text-6xl font-bold mb-8">00:00:00</div>
                    <button 
                        data-action="stop-usage"
                        id="stopTimeUsage" 
                        class="w-48 h-48 bg-red-200 hover:bg-red-300 text-gray-800 rounded-3xl shadow-lg flex flex-col items-center justify-center">
                        <span class="text-2xl font-bold mb-2">STOP</span>
                        <span class="text-sm text-center">USING TIME</span>
                    </button>
                </div>
            </div>
        </div>
        `;        

        // Holiday Wallet Section
        const holidayWallet = document.createElement('div');
        holidayWallet.className = 'flex-1 bg-white rounded-lg shadow-lg p-6 h-1/2';
        holidayWallet.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">Holiday Wallet</h2>
                <div class="flex items-center gap-2">
                    <span id="holidayTotal" class="text-2xl font-bold">00:00:00</span>
                    <button id="holidayInfo" class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        i
                    </button>
                </div>
            </div>
            <div id="holidayWalletContent" class="h-[calc(100%-3rem)] overflow-y-auto">
                <!-- Holiday wallet content will be inserted here -->
            </div>
        `;

        rightColumn.appendChild(todayWallet);
        rightColumn.appendChild(holidayWallet);
        return rightColumn;
    }
}
