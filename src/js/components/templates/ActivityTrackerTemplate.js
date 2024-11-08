/**
 * @file src/js/components/templates/ActivityTrackerTemplate.js
 * @typedef {import('../../types/Types').TimeTrackingState} TimeTrackingState
 * @typedef {import('../../types/Types').Activity} Activity
 */

import { DateTimeUtils } from '../../utils/DateTimeUtils.js';
import { TimerAnimationService } from '../../services/TimerAnimationService.js';
import { WalletCalculationService } from '../../services/WalletCalculationService.js';
import { TimeTrackingService } from '../../services/TimeTrackingService.js';
import { stateManager } from '../../services/StateManager.js';

export class ActivityTrackerTemplate {
    /**
     * @param {string} sUserId - User ID for tracking
     */
    constructor(sUserId) {
        // Services
        this.timerAnimationService = new TimerAnimationService();
        this.walletCalculationService = new WalletCalculationService();
        this.timeTrackingService = new TimeTrackingService(sUserId);
        
        // State
        this.sUserId = sUserId;
        this.timerInterval = null;
        this.usageTimerInterval = null;
        
        // DOM References
        /** @type {Object.<string, HTMLElement>} */
        this.domRefs = {};
    }

    /**
     * Initialize DOM references
     * @private
     */
    _initializeDomReferences() {
        const refs = {
            startTracking: 'startTracking',
            stopTracking: 'stopTracking',
            startTimeUsage: 'startTimeUsage',
            stopTimeUsage: 'stopTimeUsage',
            timer: 'timer',
            usageTimer: 'usageTimer',
            todayTotalTimeLeft: 'todayTotalTimeLeft',
            todayActivitiesTotal: 'todayActivitiesTotal',
            activitiesList: 'activitiesList',
            startButtonContainer: 'startButtonContainer',
            timerContainer: 'timerContainer',
            startUsageContainer: 'startUsageContainer',
            usageTimerContainer: 'usageTimerContainer'
        };

        // Initialize all references
        for (const [key, id] of Object.entries(refs)) {
            const element = document.getElementById(id);
            if (element) {
                this.domRefs[key] = element;
            } else {
                console.warn(`Element with id ${id} not found`);
            }
        }
    }

    /**
     * Creates the activity tracker page layout
     * @param {Activity[]} arActivities - Array of today's activities
     * @returns {HTMLElement} The main container element
     */
    createLayout(arActivities = []) {
        const container = document.createElement('div');
        container.className = 'md:grid md:grid-cols-2 md:grid-rows-2 flex flex-col gap-4 min-h-screen p-4 overflow-auto md:overflow-hidden bg-gray-100';
        
        container.appendChild(this._createLeftColumn());
        container.appendChild(this._createRightColumn());
        
        // Initialize after DOM is ready
        requestAnimationFrame(() => {
            this._initializeDomReferences();
            this._initializeEventListeners();
            this._updateDisplays(arActivities);
        });
        
        return container;
    }

    /**
     * Initialize all event listeners
     * @private
     */
    _initializeEventListeners() {
        // Just dispatch events for TodayWallet to handle
        if (this.domRefs.startTracking) {
            this.domRefs.startTracking.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('activityAction', { 
                    detail: { action: 'start' }
                }));
            });
        }
        
        if (this.domRefs.stopTracking) {
            this.domRefs.stopTracking.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('activityAction', { 
                    detail: { action: 'stop' }
                }));
            });
        }
    }

    /**
     * Update all display elements
     * @param {Activity[]} arActivities - Current activities
     * @private
     */
    _updateDisplays(arActivities) {
        const nTotalAvailable = this.walletCalculationService.calculateTotalLeftPlayTimeToday(arActivities);
        const nTotalAccumulated = this.walletCalculationService.calculateTotalActivityAcumulatedDurationToday(arActivities);
        
        this._updateTimerDisplay('todayTotalTimeLeft', nTotalAvailable);
        this._updateTimerDisplay('todayActivitiesTotal', nTotalAccumulated);
    }

    /**
     * Update specific timer display
     * @param {string} sRefKey - DOM reference key
     * @param {number} nTime - Time in milliseconds
     * @private
     */
    _updateTimerDisplay(sRefKey, nTime) {
        if (this.domRefs[sRefKey]) {
            this.domRefs[sRefKey].textContent = DateTimeUtils.formatDuration(nTime);
        }
    }

    /**
     * Start usage timer updates
     * @private
     */
    _startUsageTimer() {
        if (this.usageTimerInterval) clearInterval(this.usageTimerInterval);
        
        let nStartTime = Date.now();
        this.usageTimerInterval = setInterval(() => {
            if (this.domRefs.usageTimer) {
                const nElapsed = Date.now() - nStartTime;
                this.domRefs.usageTimer.textContent = DateTimeUtils.formatDuration(nElapsed);
            }
        }, 1000);
    }

    /**
     * Stop usage timer updates
     * @private
     */
    _stopUsageTimer() {
        if (this.usageTimerInterval) {
            clearInterval(this.usageTimerInterval);
            this.usageTimerInterval = null;
        }
    }

    /**
     * Creates the left column with activity tracking
     * @returns {HTMLElement}
     * @private
     */
    _createLeftColumn() {
        const leftColumn = document.createElement('div');
        // Adjust height and spacing for mobile
        leftColumn.className = 'md:col-span-1 md:row-span-2 flex flex-col gap-4 md:h-full h-auto';

        leftColumn.innerHTML = `
            <div class="flex-1 bg-white rounded-lg shadow-lg p-4 md:p-6 md:h-1/2 flex flex-col">
                <div id="activityTracker" class="h-full flex flex-col">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-lg md:text-xl font-bold">Start Activity</h2>
                        <div id="todayActivitiesTotal" class="text-xl md:text-2xl font-bold">00:00:00</div>
                    </div>
                    <div id="startButtonContainer" class="flex-1 flex items-center justify-center">
                        <button 
                            data-action="start-tracking" 
                            id="startTracking"
                            class="w-48 h-48 md:w-64 md:h-64 bg-green-500 hover:bg-green-600 text-white rounded-3xl shadow-lg transform transition-all duration-300 flex flex-col items-center justify-center">
                            <span class="text-3xl md:text-4xl font-bold mb-2">START</span>
                            <span class="text-xs md:text-sm">DEPOSITING ACTIVITY TIME</span>
                        </button>
                    </div>
                    <div id="timerContainer" class="hidden h-full">
                        <div class="h-full flex flex-col items-center justify-center">
                            <div id="timer" class="text-4xl md:text-6xl font-bold mb-4 md:mb-8">00:00:00</div>
                            <button 
                                data-action="stop-tracking"
                                id="stopTracking" 
                                class="w-36 h-36 md:w-48 md:h-48 bg-red-500 hover:bg-red-600 text-white rounded-3xl shadow-lg flex flex-col items-center justify-center">
                                <span class="text-xl md:text-2xl font-bold mb-2">STOP</span>
                                <span class="text-xs md:text-sm text-center">ACTIVITY AND<br>DEPOSIT TO MY BANK</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex-1 bg-white rounded-lg shadow-lg p-4 md:p-6 md:h-1/2 flex flex-col min-h-[300px] md:min-h-0">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg md:text-xl font-bold">Today's Activities</h2>
                </div>
                <div id="activitiesList" class="overflow-y-auto flex-1">
                    <!-- Activities will be inserted here -->
                </div>
            </div>
        `;

        return leftColumn;
    }

    /**
     * Creates the right column with wallet information
     * @returns {HTMLElement}
     * @private
     */
    _createRightColumn() {
        const rightColumn = document.createElement('div');
        rightColumn.className = 'md:col-span-1 md:row-span-2 flex flex-col gap-4 md:h-full h-auto';
    
        rightColumn.innerHTML = `
            <div id="todayWalletPanel" class="flex-1 bg-white rounded-lg shadow-lg p-4 md:p-6 md:h-1/2 flex flex-col min-h-[300px] md:min-h-0">
                <div id="timeUsageTracker" class="h-full flex flex-col justify-center items-center">
                    <div class="flex justify-between items-center mb-4 w-full">
                        <h2 class="text-lg md:text-xl font-bold">Today's Wallet Earned Time</h2>
                        <div id="todayTotalTimeLeft" class="text-xl md:text-2xl font-bold">00:00:00</div>
                    </div>
                    <div id="startUsageContainer" class="flex-1 flex items-center justify-center h-full">
                        <button 
                            data-action="start-usage" 
                            id="startTimeUsage"
                            class="w-48 h-48 md:w-64 md:h-64 bg-yellow-200 hover:bg-yellow-300 text-gray-800 rounded-3xl shadow-lg transform transition-all duration-300 flex flex-col items-center justify-center">
                            <span class="text-3xl md:text-4xl font-bold mb-2">USE</span>
                            <span class="text-xs md:text-sm">MY TIME</span>
                        </button>
                    </div>
                    <div id="usageTimerContainer" class="hidden h-full flex flex-col items-center justify-center">
                        <div id="usageTimer" class="text-4xl md:text-6xl font-bold mb-4 md:mb-8">00:00:00</div>
                        <button 
                            data-action="stop-usage"
                            id="stopTimeUsage" 
                            class="w-36 h-36 md:w-48 md:h-48 bg-red-200 hover:bg-red-300 text-gray-800 rounded-3xl shadow-lg flex flex-col items-center justify-center">
                            <span class="text-xl md:text-2xl font-bold mb-2">STOP</span>
                            <span class="text-xs md:text-sm text-center">USING TIME</span>
                        </button>
                    </div>
                </div>
            </div>
    
            <div id="holidayWallet" class="flex-1 bg-white rounded-lg shadow-lg p-4 md:p-6 md:h-1/2 flex flex-col min-h-[300px] md:min-h-0">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg md:text-xl font-bold">Holiday Wallet</h2>
                    <div class="flex items-center gap-2">
                        <span id="holidayTotal" class="text-xl md:text-2xl font-bold">00:00:00</span>
                        <button id="holidayInfo" class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            i
                        </button>
                    </div>
                </div>
                <div class="mb-2">
                    <span id="weekendBonus" class="text-xs md:text-sm text-gray-600"></span>
                </div>
                <div id="holidayWalletContent" class="flex-1 overflow-y-auto">
                    <!-- Holiday wallet content will be inserted here -->
                </div>                
            </div>
        `;
    
        return rightColumn;
    }
    

}