/**
 * @file src/js/components/wallets/TodayWallet.js
 * Manages the today's wallet functionality including activity tracking and time calculations
 */

// Use JSDoc imports for complex types
/** @typedef {import('../../types/Types.js').TimeTrackingState} TimeTrackingState */
/** @typedef {import('../../types/Types.js').Activity} Activity */
/** @typedef {import('../../types/Types.js').TimeDeposit} TimeDeposit */

import { WalletType, DepositStatus } from '../../types/Types.js';
import { generateId } from '../../utils/IdUtils.js';
import { WalletCalculationService } from '../../services/WalletCalculationService.js';
import { DateTimeUtils } from '../../utils/DateTimeUtils.js';
import { TimeCalculationService } from '../../services/TimeCalculationService.js';

// Initialize an instance of TimeCalculationService
const timeCalculationService = new TimeCalculationService();

/**
 * Manages the today's wallet functionality including activity tracking and time calculations
 */
export class TodayWallet {
    /**
     * @param {Object} stateManager - State management service
     * @param {Object} timeCalculationService - Time calculation service
     * @param {Object} modalManager - Modal management service
     */
    constructor(stateManager, timeCalculationService, modalManager) {
        this.stateManager = stateManager;
        this.timeCalculationService = timeCalculationService;
        this.modalManager = modalManager;
        this.walletCalculationService = new WalletCalculationService();

        // Initialize base state
        this.trackingState = {
            bIsTracking: false,
            nStartTime: null,
            sCurrentActivityDescription: ''
        };

        this.timerInterval = null;
        
        // Defer initialization to ensure DOM is ready
        requestAnimationFrame(() => this.initialize());
    }

    /**
     * Initialize the wallet component
     * @private
     */
    async initialize() {
        try {
            await this.initializeElements();
            if (this.allElementsExist()) {
                await this.loadTrackingState();
                this.bindEvents();
                await this.updateActivitiesList();
                await this.updateWalletDisplay();
                this.bindTimeUsageEvents();
            } else {
                console.warn('Some required elements are missing');
            }
        } catch (error) {
            console.error('Failed to initialize TodayWallet:', error);
        }
    }

    /**
     * Initialize DOM elements
     * @private
     * @returns {Promise<void>}
     */
    async initializeElements() {
        // Core tracking elements
        this.startButton = document.getElementById('startTracking');
        this.stopButton = document.getElementById('stopTracking');
        this.timerElement = document.getElementById('timer');
        this.startButtonContainer = document.getElementById('startButtonContainer');
        this.timerContainer = document.getElementById('timerContainer');
        this.todayActivitiesTotal = document.getElementById('todayActivitiesTotal');
        
        // Usage elements
        this.startTimeUsageBtn = document.getElementById('startTimeUsage');
        this.stopTimeUsageBtn = document.getElementById('stopTimeUsage');
        this.usageTimerElement = document.getElementById('usageTimer');
        this.usageTimerContainer = document.getElementById('usageTimerContainer');
        this.startUsageContainer = document.getElementById('startUsageContainer');
        
        // Display elements
        this.activitiesList = document.getElementById('activitiesList');
        this.todayTotalTimeLeft = document.getElementById('todayTotalTimeLeft');
        this.todayWalletContent = document.getElementById('todayWalletContent');

        // Verify critical elements
        const missingElements = [];
        [
            { name: 'startButton', el: this.startButton },
            { name: 'stopButton', el: this.stopButton },
            { name: 'timerElement', el: this.timerElement },
            { name: 'startButtonContainer', el: this.startButtonContainer },
            { name: 'timerContainer', el: this.timerContainer },
            { name: 'todayActivitiesTotal', el: this.todayActivitiesTotal }
        ].forEach(({ name, el }) => {
            if (!el) missingElements.push(name);
        });

        if (missingElements.length > 0) {
            console.warn('Missing elements:', missingElements);
            throw new Error(`Missing required elements: ${missingElements.join(', ')}`);
        }
    }

    /**
     * Check if all required elements exist
     * @private
     * @returns {boolean}
     */
    allElementsExist() {
        const requiredElements = [
            this.startButton,
            this.stopButton,
            this.timerElement,
            this.startButtonContainer,
            this.timerContainer,
            this.activitiesList,
            this.todayTotalTimeLeft,
            this.todayWalletContent
        ];

        return requiredElements.every(element => element !== null);
    }

    /**
     * Bind event listeners
     * @private
     */
    bindEvents() {
        this.startButton.addEventListener('click', () => this.startTracking());
        this.stopButton.addEventListener('click', () => this.stopTracking());

        // Listen for page unload to save state
        window.addEventListener('beforeunload', () => this.saveTrackingState());

        if (this.todayWalletContent) {
            this.todayWalletContent.addEventListener('click', (e) => {
                const transferButton = e.target.closest('[data-action="transfer-to-holiday"]');
                if (transferButton) {
                    const depositId = transferButton.dataset.depositId;
                    this.handleHolidayTransfer(depositId);
                }
            });
        }

        document.addEventListener('activityAction', (e) => {
            if (e.detail.action === 'start') {
                this.startTracking();
            } else if (e.detail.action === 'stop') {
                this.stopTracking();
            }
        });
    }

    /**
     * Load tracking state from storage
     * @private
     */
    async loadTrackingState() {
        try {
            const savedState = await this.stateManager.getTrackingState();
            if (savedState && savedState.bIsTracking) {
                this.trackingState = savedState;
                this.resumeTracking();
            }
        } catch (error) {
            console.error('Error loading tracking state:', error);
        }
    }

    /**
     * Bind time usage events
     * @private
     */
    bindTimeUsageEvents() {
        this.startTimeUsageBtn?.addEventListener('click', () => this.startTimeUsage());
        this.stopTimeUsageBtn?.addEventListener('click', () => this.stopTimeUsage());
    }

     /**
     * Update button states based on tracking/usage status
     * @private
     */
     updateButtonStates() {
        const isTracking = this.trackingState.bIsTracking;
        const isUsingTime = this.trackingState.bIsUsingTime;

        // Start tracking button
        if (this.startButton) {
            this.startButton.disabled = isUsingTime;
            this.startButton.classList.toggle('bg-gray-300', isUsingTime);
            this.startButton.classList.toggle('hover:bg-gray-400', isUsingTime);
            this.startButton.classList.toggle('bg-green-500', !isUsingTime);
            this.startButton.classList.toggle('hover:bg-green-600', !isUsingTime);
        }

        // Start usage button
        if (this.startTimeUsageBtn) {
            this.startTimeUsageBtn.disabled = isTracking;
            this.startTimeUsageBtn.classList.toggle('bg-gray-300', isTracking);
            this.startTimeUsageBtn.classList.toggle('hover:bg-gray-400', isTracking);
            this.startTimeUsageBtn.classList.toggle('bg-yellow-200', !isTracking);
            this.startTimeUsageBtn.classList.toggle('hover:bg-yellow-300', !isTracking);
        }
    }

    /**
     * Start time usage
     * @private
     */
    async startTimeUsage() {
        const userId = this.stateManager.getCurrentUserId();
        console.log("userId:", userId);
        const activities = await this.stateManager.getActivities(userId);
        console.log("2activities:", activities);
        const availableActivities = activities.filter(a => a.bIsAvailableForDeposit);
        console.log("availableActivities:", availableActivities);

        if (availableActivities.length === 0) {
            this.modalManager.showInfo({
                sTitle: 'No Time Available',
                sContent: 'There is no time available to use. Please deposit some activity time first.'
            });
            return;
        }

        this.trackingState.bIsUsingTime = true;
        this.trackingState.nUsageStartTime = Date.now();
        
        // Update UI
        this.startUsageContainer.classList.add('hidden');
        this.usageTimerContainer.classList.remove('hidden');
        
        // Start usage timer
        this.usageTimerInterval = setInterval(() => this.updateUsageTimer(), 1000);

        // Update button states
        this.updateButtonStates();
        
        // Save state
        await this.saveTrackingState();
        
        // Highlight current activity being used
        this.updateActivitiesList();
    }

    
    /**
     * Stop time usage
     * @private
     */
    async stopTimeUsage() {
        if (!this.trackingState.bIsUsingTime) return;

        const userId = this.stateManager.getCurrentUserId();
        const activities = await this.stateManager.getActivities(userId);
        
        // Calculate used time
        const usedTime = Date.now() - this.trackingState.nUsageStartTime;
        let remainingUsageTime = usedTime;

        // Update activities with used time
        const updatedActivities = activities.map(activity => {
            if (!activity.bIsAvailableForDeposit) return activity;
            
            const remainingTime = this.walletCalculationService.calculateRemainingTime(activity);
            if (remainingUsageTime <= 0) return activity;

            const timeToUse = Math.min(remainingUsageTime, remainingTime);
            remainingUsageTime -= timeToUse;
            
            return {
                ...activity,
                nUsedDuration: (activity.nUsedDuration || 0) + timeToUse,
                bIsAvailableForDeposit: timeToUse < remainingTime
            };
        });

        // Update state for each modified activity
        for (const activity of updatedActivities) {
            await this.stateManager.updateActivity(activity);
        }

        // Reset tracking state
        clearInterval(this.usageTimerInterval);
        this.trackingState.bIsUsingTime = false;
        this.trackingState.nUsageStartTime = null;
        
        // Update UI
        this.usageTimerContainer.classList.add('hidden');
        this.startUsageContainer.classList.remove('hidden');
        this.updateButtonStates();
        this.updateActivitiesList();
        await this.updateWalletDisplay();
        
        // Save state
        await this.saveTrackingState();
    }

    /**
     * Update usage timer display and check limits
     * @private
     */
    async updateUsageTimer() {
        if (!this.trackingState.bIsUsingTime || !this.trackingState.nUsageStartTime) return;
        
        const duration = Date.now() - this.trackingState.nUsageStartTime;
        this.usageTimerElement.textContent = DateTimeUtils.formatDuration(duration);

        // Check if we've exceeded available time
        if (await this.isTimeUsageExceeded(duration)) {
            await this.stopTimeUsage();
            this.addBlinkingEffect();
            this.modalManager.showInfo({
                sTitle: 'Time Limit Reached',
                sContent: 'You have used all available time for today.'
            });
        }
    }

    /**
     * Add blinking effect to wallet panel
     * @private
     */
    addBlinkingEffect() {
        const panel = document.getElementById('todayWalletPanel');
        if (!panel) return;

        let blinkCount = 0;
        const blinkInterval = setInterval(() => {
            blinkCount++;
            panel.classList.toggle('bg-red-100');
            
            if (blinkCount >= 10) { // 5 complete cycles (on/off)
                clearInterval(blinkInterval);
                panel.classList.remove('bg-red-100');
            }
        }, 300); // 300ms for each state change
    }

     /**
     * Check if time usage would exceed available time
     * @param {number} usedTime - Time being used
     * @returns {boolean}
     * @private
     */
     async isTimeUsageExceeded(usedTime) {
        const userId = this.stateManager.getCurrentUserId();
        const activities = await this.stateManager.getActivities(userId);
        const totalAvailable = this.walletCalculationService.calculateTotalLeftPlayTimeToday(activities);
        
        return usedTime > totalAvailable;
    }


    /**
     * Save tracking state to storage
     * @private
     */
    async saveTrackingState() {
        try {
            await this.stateManager.saveTrackingState(this.trackingState);
        } catch (error) {
            console.error('Error saving tracking state:', error);
        }
    }

    /**
     * Resume tracking from saved state
     * @private
     */
    resumeTracking() {
        if (this.trackingState.bIsTracking && this.trackingState.nStartTime) {
            // Update UI
            this.startButtonContainer.classList.add('hidden');
            this.timerContainer.classList.remove('hidden');
            
            // Resume timer
            this.updateTimer();
            this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        }
    }

    /**
     * Update wallet display with current totals and deposits
     * @private
     */
    async updateWalletDisplay() {
        const userId = this.stateManager.getCurrentUserId();
        const [deposits, activities] = await Promise.all([
            this.stateManager.getDeposits(userId),
            this.stateManager.getActivities(userId)
        ]);

        // Update total available time
        const totalAvailable = this.walletCalculationService.calculateTotalLeftPlayTimeToday(activities);
        if (this.todayTotalTimeLeft) {
            this.todayTotalTimeLeft.textContent = DateTimeUtils.formatDuration(totalAvailable);
        }

        // Get and display today's deposits
        if (this.todayWalletContent) {
            const todayDeposits = this.walletCalculationService.getTodayDeposits(deposits, activities);
            this.todayWalletContent.innerHTML = this.createWalletContent(todayDeposits);
        }
    }

     /**
     * Create HTML content for wallet deposits
     * @param {Array<{deposit: TimeDeposit, activity: Activity}>} deposits
     * @returns {string}
     * @private
     */
    createWalletContent(deposits) {
        return deposits.map(({ deposit, activity }) => `
            <div class="flex items-center justify-between p-3 border-b" data-deposit-id="${deposit.sId}">
                <div class="flex-1">
                    <div class="font-medium">${activity?.sDescription || 'Unknown activity'}</div>
                    <div class="text-sm text-gray-500">
                        ${new Date(deposit.nDepositTimestamp).toLocaleTimeString()}
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <div class="text-right">
                        <div class="font-medium">${DateTimeUtils.formatDuration(deposit.nDepositedTime)}</div>
                        ${deposit.nBonusTime > 0 ? 
                            `<div class="text-sm text-green-600">+${DateTimeUtils.formatDuration(deposit.nBonusTime)} bonus</div>` : 
                            ''}
                    </div>
                    ${this.walletCalculationService.canTransferToHoliday(deposit) ? `
                        <button 
                            class="p-2 rounded bg-blue-100 text-blue-600" 
                            data-action="transfer-to-holiday"
                            data-deposit-id="${deposit.sId}">
                            🏦
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

     /**
     * Start activity tracking
     * @private
     */
     async startTracking() {
        this.trackingState.bIsTracking = true;
        this.trackingState.nStartTime = Date.now();
        
        // Update UI
        this.startButtonContainer.classList.add('hidden');
        this.timerContainer.classList.remove('hidden');
        
        // Start timer
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    
        // Save state immediately
        await this.saveTrackingState();
    }

     /**
     * Stop activity tracking and create deposit
     * @private
     */
     async stopTracking() {
        if (!this.trackingState.bIsTracking) return;

        const endTime = Date.now();
        const duration = endTime - this.trackingState.nStartTime;

        try {
            // Create activity record
            /** @type {Activity} */
            const activity = {
                sId: generateId(),
                sDescription: this.trackingState.sCurrentActivityDescription || 'Unnamed activity',
                nStartTime: this.trackingState.nStartTime,
                nEndTime: endTime,
                nDuration: duration,
                nUsedDuration: 0,
                bIsAvailableForDeposit: true,
                sUserId: this.stateManager.getCurrentUserId()
            };

            // Save activity
            await this.stateManager.addActivity(activity);

            // Stop timer
            clearInterval(this.timerInterval);
            this.timerInterval = null;

            // Reset state
            this.trackingState = {
                bIsTracking: false,
                nStartTime: null,
                sCurrentActivityDescription: ''
            };

            // Update displayed values
            const userId = this.stateManager.getCurrentUserId();
            console.log("stopTracking userId:", userId);
            const activities = await this.stateManager.getActivities(userId);
            console.log("stopTracking activities:", activities);
            const todayStart = new Date().setHours(0, 0, 0, 0);
            const todayActivities = activities.filter(activity => 
                activity.nStartTime >= todayStart
            );
            const totalAccumulated = this.walletCalculationService
            .calculateTotalActivityAcumulatedDurationToday(todayActivities);
            console.log('stopTracking totalAccumulated:', totalAccumulated);

            // Update total using class property
            this.todayActivitiesTotal.textContent = DateTimeUtils.formatDuration(totalAccumulated);

            // Save state and update displays
            await this.saveTrackingState();
            await this.updateActivitiesList();
            await this.updateWalletDisplay();

            // Notify other components
            document.dispatchEvent(new CustomEvent('activityStopped', { 
                detail: { activity } 
            }));

        } catch (error) {
            console.error('Error stopping activity:', error);
            this.modalManager?.showError({
                sTitle: 'Error',
                sContent: 'Failed to stop activity tracking. Please try again.'
            });
        } finally {
            // Ensure UI is in a valid state regardless of success or failure
            this.startButtonContainer.classList.remove('hidden');
            this.timerContainer.classList.add('hidden');
        }
    }

     /**
     * Handle transfer to holiday wallet
     * @param {string} depositId
     * @private
     */
    async handleHolidayTransfer(depositId) {
        const deposits = await this.stateManager.getDeposits(this.stateManager.getCurrentUserId());
        const deposit = deposits.find(d => d.sId === depositId);
        
        if (!deposit || !this.walletCalculationService.canTransferToHoliday(deposit)) {
            return;
        }

        // Get user settings for bonus calculation
        const userSettings = await this.stateManager.getUserSettings(deposit.sUserId);
        const holidayDeposit = this.walletCalculationService.prepareHolidayTransfer(
            deposit, 
            userSettings.nHolidayBonusPercentage
        );

        // Update original deposit status and add new holiday deposit
        await this.stateManager.updateDeposit({
            ...deposit,
            sStatus: DepositStatus.HOLIDAY_DEPOSITED
        });
        await this.stateManager.addDeposit(holidayDeposit);

        // Update display
        await this.updateWalletDisplay();
    }

    /**
     * Update timer display
     * @private
     */
    updateTimer() {
        if (!this.trackingState.bIsTracking || !this.trackingState.nStartTime) return;
        
        const duration = Date.now() - this.trackingState.nStartTime;
        this.timerElement.textContent = DateTimeUtils.formatDuration(duration);
    }

    /**
     * Update activities list display
     * @private
     */
    async updateActivitiesList() {
        const activities = await this.stateManager.getActivities(this.stateManager.getCurrentUserId());
        const todayStart = new Date().setHours(0, 0, 0, 0);
        
        const todayActivities = activities.filter(activity => 
            activity.nStartTime >= todayStart
        );

        this.activitiesList.innerHTML = todayActivities.map(activity => this.createActivityItem(activity)).join('');
    }

    /**
     * Create HTML for activity list item
     * @param {Activity} activity
     * @returns {string}
     * @private
     */
    createActivityItem(activity) {
        const isCurrentlyUsed = this.trackingState.bIsUsingTime && 
                              this.trackingState.sCurrentUsageActivityId === activity.sId;
        const isFullyUsed = !activity.bIsAvailableForDeposit;
        
        return `
            <div class="flex items-center justify-between p-3 border-b ${isCurrentlyUsed ? 'bg-yellow-50' : ''}" 
                 data-activity-id="${activity.sId}">
                <div class="flex-1">
                    <input type="text" 
                           class="w-full p-2 border rounded"
                           value="${activity.sDescription}"
                           placeholder="Enter activity description"
                           ${isFullyUsed ? 'disabled' : ''}>
                </div>
                <div class="flex items-center gap-2 ml-4">
                    <span class="font-medium">${DateTimeUtils.formatDuration(activity.nDuration)}</span>
                    ${activity.nUsedDuration > 0 ? 
                        `<span class="text-sm text-gray-500">
                            (${DateTimeUtils.formatDuration(activity.nUsedDuration)} used)
                        </span>` : 
                        ''}
                    ${!isFullyUsed ? `
                        <button class="deposit-holiday p-2 rounded bg-blue-100 text-blue-600">
                            <span class="sr-only">Deposit to Holiday Wallet</span>
                            🏦
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
}