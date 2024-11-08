// @ts-check
/**
 * @file src/js/components/wallets/TodayWallet.js
 * Manages the today's wallet functionality including activity tracking and time calculations
 */

/** @typedef {import('../../types/Types.js').TimeTrackingState} TimeTrackingState */
/** @typedef {import('../../types/Types.js').Activity} Activity */
/** @typedef {import('../../types/Types.js').TimeDeposit} TimeDeposit */
/** @typedef {import('../../types/Types.js').HTMLElementWithData} HTMLElementWithData */
/** @typedef {import('../../types/Types.js').ActivityEvent} ActivityEvent */


/**
 * @typedef {Object} ActivityActionEvent extends CustomEvent
 * @property {Object} detail
 * @property {string} detail.action
 */

/**
 * @typedef {Object} CustomElements
 * @property {HTMLButtonElement} startButton
 * @property {HTMLButtonElement} stopButton
 * @property {HTMLDivElement} timerElement
 * @property {HTMLDivElement} startButtonContainer
 * @property {HTMLDivElement} timerContainer
*/

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
        if (!stateManager || !timeCalculationService || !modalManager) {
            throw new Error('Required services not provided to TodayWallet');
        }

        /** @type {Object} */
        this.stateManager = stateManager;
        
        /** @type {Object} */
        this.timeCalculationService = timeCalculationService;
        
        /** @type {Object} */
        this.modalManager = modalManager;

        // Initialize WalletCalculationService
        /** @type {Object} */
        this.walletCalculationService = new WalletCalculationService();

        // Initialize base state
        /** @type {TimeTrackingState} */
        this.trackingState = {
            bIsTracking: false,
            bIsUsingTime: false,
            nStartTime: null,
            nUsageStartTime: null,
            sCurrentActivityDescription: '',
            sCurrentUsageActivityId: null
        };

        /** @type {number|null} */
        this.timerInterval = null;
        
        // Defer initialization to ensure DOM is ready
        requestAnimationFrame(() => this.initialize());

        document.addEventListener('activityListChanged', async () => {
            await this.updateActivitiesList();
            await this.updateWalletDisplay();
        });
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
 * @throws {Error} If required elements are missing
 */
async initializeElements() {
    const startButton = document.getElementById('startTracking');
    if (startButton instanceof HTMLButtonElement) {
        this.startButton = startButton;
    }

    const stopButton = document.getElementById('stopTracking');
    if (stopButton instanceof HTMLButtonElement) {
        this.stopButton = stopButton;
    }

    const startTimeUsageBtn = document.getElementById('startTimeUsage');
    if (startTimeUsageBtn instanceof HTMLButtonElement) {
        this.startTimeUsageBtn = startTimeUsageBtn;
    }

    const stopTimeUsageBtn = document.getElementById('stopTimeUsage');
    if (stopTimeUsageBtn instanceof HTMLButtonElement) {
        this.stopTimeUsageBtn = stopTimeUsageBtn;
    }

    // For div elements
    this.timerElement = /** @type {HTMLDivElement} */ (document.getElementById('timer'));
    this.startButtonContainer = /** @type {HTMLDivElement} */ (document.getElementById('startButtonContainer'));
    this.timerContainer = /** @type {HTMLDivElement} */ (document.getElementById('timerContainer'));
    this.todayActivitiesTotal = /** @type {HTMLDivElement} */ (document.getElementById('todayActivitiesTotal'));
    this.usageTimerElement = /** @type {HTMLDivElement} */ (document.getElementById('usageTimer'));
    this.usageTimerContainer = /** @type {HTMLDivElement} */ (document.getElementById('usageTimerContainer'));
    this.startUsageContainer = /** @type {HTMLDivElement} */ (document.getElementById('startUsageContainer'));
    this.activitiesList = /** @type {HTMLDivElement} */ (document.getElementById('activitiesList'));
    this.todayTotalTimeLeft = /** @type {HTMLDivElement} */ (document.getElementById('todayTotalTimeLeft'));

    /** @type {Array<{name: string, el: HTMLElement|null}>} */
    const elementChecks = [
        { name: 'startButton', el: this.startButton },
        { name: 'stopButton', el: this.stopButton },
        { name: 'timerElement', el: this.timerElement },
        { name: 'startButtonContainer', el: this.startButtonContainer },
        { name: 'timerContainer', el: this.timerContainer },
        { name: 'todayActivitiesTotal', el: this.todayActivitiesTotal },
        { name: 'startTimeUsageBtn', el: this.startTimeUsageBtn },
        { name: 'stopTimeUsageBtn', el: this.stopTimeUsageBtn },
        { name: 'usageTimerElement', el: this.usageTimerElement },
        { name: 'usageTimerContainer', el: this.usageTimerContainer },
        { name: 'startUsageContainer', el: this.startUsageContainer },
        { name: 'activitiesList', el: this.activitiesList },
        { name: 'todayTotalTimeLeft', el: this.todayTotalTimeLeft }
    ];

    const missingElements = elementChecks
        .filter(({ el }) => !el)
        .map(({ name }) => name);

    if (missingElements.length > 0) {
        throw new Error(`Missing required elements: ${missingElements.join(', ')}`);
    }
}

    /**
     * Check if all required elements exist
     * @private
     * @returns {boolean}
     */
    allElementsExist() {
        // Type assertion for each button to ensure proper type checking
        if (!(this.startButton instanceof HTMLButtonElement)) return false;
        if (!(this.stopButton instanceof HTMLButtonElement)) return false;
        if (!(this.startTimeUsageBtn instanceof HTMLButtonElement)) return false;
        if (!(this.stopTimeUsageBtn instanceof HTMLButtonElement)) return false;

        // Check Div elements
        const requiredDivElements = [
            this.timerElement,
            this.startButtonContainer,
            this.timerContainer,
            this.todayActivitiesTotal,
            this.usageTimerElement,
            this.usageTimerContainer,
            this.startUsageContainer,
            this.activitiesList,
            this.todayTotalTimeLeft
        ];

        // Check if all div elements exist
        if (!requiredDivElements.every(element => element instanceof HTMLDivElement)) {
            return false;
        }

        return true;
    }
    /**
     * Binds event listeners to DOM elements
     * @returns {void}
     */
    bindEvents() {
        this.startButton.addEventListener('click', () => this.startTracking());
        this.stopButton.addEventListener('click', () => this.stopTracking());

        // Listen for page unload to save state
        window.addEventListener('beforeunload', () => this.saveTrackingState());

        if (this.activitiesList) {
            this.activitiesList.addEventListener('click', async (event) => {
                const userId = this.stateManager.getCurrentUserId();
                const obTarget = /** @type {HTMLElementWithData} */ (event.target);
                // Look for the closest button with transfer action
                const transferButton = obTarget.closest('[data-action="transfer-to-holiday"]');
                if (transferButton) {
                    const sActivityId = transferButton.getAttribute('data-activity-id');
                    const arActivitiesLog = await this.stateManager.getActivities(userId);
                    const obActivity = arActivitiesLog.find(a => a.sId === sActivityId);
                    if (obActivity) {
                        await this.handleHolidayTransfer(obActivity);
                    }
                }
            });
        }

        // Deposit button event binding
        this.activitiesList.addEventListener('click', async (event) => {
            const userId = this.stateManager.getCurrentUserId();
            const obTarget = /** @type {HTMLElementWithData} */ (event.target);
            const depositButton = obTarget.closest('.deposit-holiday');
            if (depositButton) {
                const sActivityId = /** @type {HTMLElementWithData} */ (depositButton).dataset.activityId;
                const arActivitiesLog = await this.stateManager.getActivities(userId);
                const obActivity = arActivitiesLog.find(a => a.sId === sActivityId);
                if (sActivityId) {
                    await this.handleHolidayTransfer(obActivity);
                }
            }
        });

        // Custom event listener for activity actions
        document.addEventListener('activityAction', ((e) => {
            const customEvent = /** @type {ActivityEvent} */ (e);
            if (customEvent.detail.action === 'start') {
                this.startTracking();
            } else if (customEvent.detail.action === 'stop') {
                this.stopTracking();
            }
        }));
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
        console.log("startTimeUsage userId:", userId);
        const activities = await this.stateManager.getActivities(userId);
        console.log("startTimeUsage activities:", activities);
        const availableActivities = activities.filter(a => a.bIsAvailableForDeposit);
        console.log("startTimeUsage availableActivities:", availableActivities);

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
     * @returns {Promise<boolean>}
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
        const sUserId = this.stateManager.getCurrentUserId();
        const [arDeposits, arActivities] = await Promise.all([
            this.stateManager.getDeposits(sUserId),
            this.stateManager.getActivities(sUserId)
        ]);
    
        const nTotalAvailable = this.walletCalculationService.calculateTotalLeftPlayTimeToday(arActivities);
        if (this.todayTotalTimeLeft) {
            this.todayTotalTimeLeft.textContent = DateTimeUtils.formatDuration(nTotalAvailable);
        }
    
        // if (this.todayWalletContent) { // Add existence check
        //     const arTodayDeposits = this.walletCalculationService.getTodayDeposits(arDeposits, arActivities);
        //     this.todayWalletContent.innerHTML = this.createWalletContent(arTodayDeposits);
        // } else {
        //     console.warn('todayWalletContent is missing, unable to update wallet display.');
        // }
    }
     /**
     * Create HTML for wallet deposits
     * @param {Array<{deposit: TimeDeposit, activity: Activity}>} arDeposits
     * @returns {string} HTML string for wallet deposits
     * @private
     */
    createWalletContent(arDeposits) {
        return arDeposits.map(({ deposit, activity }) => `
            <div class="flex items-center justify-between p-3 border-b" data-deposit-id="${deposit.sId}">
                <div class="flex-1">
                    <div class="font-medium">${activity?.sDescription || 'Unknown activity'}</div>
                    <div class="text-sm text-gray-500">
                        ${new Date(deposit.nDepositTimestamp).toLocaleTimeString()}
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <div class="text-right">
                        <div class="font-medium">${DateTimeUtils.formatDuration(deposit.nDepositTimestamp)}</div>
                        ${deposit.nAccumulatedBonus > 0 ? 
                            `<div class="text-sm text-green-600">+${DateTimeUtils.formatDuration(deposit.nAccumulatedBonus)} bonus</div>` : 
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
        const dCurrentDate = new Date();
        const nWeekNumber = DateTimeUtils.getWeekNumber(dCurrentDate);

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
                sUserId: this.stateManager.getCurrentUserId(),
                nWeekNumber: nWeekNumber,
                nYear: dCurrentDate.getFullYear(),
            };

            // Save activity
            await this.stateManager.addActivity(activity);

            // Stop timer
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }

            // Reset state
            this.trackingState = {
                bIsTracking: false,
                bIsUsingTime: false,
                nStartTime: null,
                nUsageStartTime: null,
                sCurrentActivityDescription: '',
                sCurrentUsageActivityId: null
            };

            // Update displayed values
            const userId = this.stateManager.getCurrentUserId();
            if (!userId) {
                throw new Error('No current user ID available');
            }

            const activities = await this.stateManager.getActivities(userId);
            if (!activities) {
                throw new Error('Failed to retrieve activities');
            }

            const todayStart = new Date().setHours(0, 0, 0, 0);
            const todayActivities = activities.filter(activity => 
                activity.nStartTime >= todayStart
            );

            // Ensure walletCalculationService exists
            if (!this.walletCalculationService) {
                throw new Error('WalletCalculationService not initialized');
            }

            const totalAccumulated = this.walletCalculationService
                .calculateTotalActivityAcumulatedDurationToday(todayActivities);

            // Check if element exists before updating
            if (this.todayActivitiesTotal instanceof HTMLDivElement) {
                this.todayActivitiesTotal.textContent = DateTimeUtils.formatDuration(totalAccumulated);
            }

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
            
            // Check if modalManager exists and has showError method
            if (this.modalManager && typeof this.modalManager.showError === 'function') {
                this.modalManager.showError({
                    sTitle: 'Error',
                    sContent: 'Failed to stop activity tracking. Please try again.'
                });
            } else {
                console.error('Modal manager not properly initialized');
            }
        } finally {
            // Ensure UI is in a valid state regardless of success or failure
            if (this.startButtonContainer instanceof HTMLDivElement) {
                this.startButtonContainer.classList.remove('hidden');
            }
            if (this.timerContainer instanceof HTMLDivElement) {
                this.timerContainer.classList.add('hidden');
            }
        }
    }

    /**
     * Handle transfer to holiday wallet
     * @param {Activity} obActivity - Activity to transfer
     * @private
     */
    async handleHolidayTransfer(obActivity) {
        try {
            const sUserId = this.stateManager.getCurrentUserId();
            const arActivities = await this.stateManager.getActivities(sUserId);
            
            if (!obActivity || !obActivity.bIsAvailableForDeposit) {
                throw new Error('Activity not available for deposit');
            }

            // Get user settings for bonus calculation
            const obUserSettings = await this.stateManager.getUserSettings(sUserId);
            if (!obUserSettings) {
                throw new Error('User settings not found');
            }

            const dCurrentDate = new Date();
            const nWeekNumber = DateTimeUtils.getWeekNumber(dCurrentDate);

            // Calculate deposit and bonus times
            const nDepositedDuration = obActivity.nDuration - (obActivity.nUsedDuration || 0);
            const nAccumulatedBonus = Math.floor(nDepositedDuration * 
                                    (obUserSettings.nHolidayBonusPercentage / 100));

            // Create holiday deposit with proper structure
            const obNewDeposit = {
                sId: generateId(),
                sDescription: obActivity.sDescription, // Include description
                sUserId: sUserId,
                nStartTime: obActivity.nStartTime,    // Include original times
                nEndTime: obActivity.nEndTime,
                nDuration: obActivity.nDuration,
                nUsedDuration: 0,                     // Reset for new deposit
                nDepositedDuration: nDepositedDuration, // Renamed from nDepositedTime
                nAccumulatedBonus: nAccumulatedBonus,   // Renamed from nBonusTime
                nDepositTimestamp: Date.now(),
                nWeekNumber: nWeekNumber,
                nYear: dCurrentDate.getFullYear(),
                bIsAvailableForDeposit: true
            };

            // Get current user state
            const obUser = await this.stateManager.getUser(sUserId);
            if (!obUser) {
                throw new Error('User not found');
            }

            // Remove activity from arActivityLog
            obUser.arActivityLog = obUser.arActivityLog.filter(a => a.sId !== obActivity.sId);

            // Add deposit to arDeposits
            if (!obUser.arDeposits) {
                obUser.arDeposits = [];
            }
            obUser.arDeposits.push(obNewDeposit);

            // Update user state
            await this.stateManager.updateUser(obUser);

            // Play deposit sound
            const obDepositSound = new Audio('/src/audio/cha-ching-7053.mp3');
            await obDepositSound.play().catch(console.error);

            // Show success message
            this.modalManager.showSuccess({
                sTitle: 'Success!',
                sContent: `Activity transferred to holiday wallet with ${obUserSettings.nHolidayBonusPercentage}% bonus!`
            });

            // Notify holiday wallet
            document.dispatchEvent(new CustomEvent('depositAdded', { 
                detail: { deposit: obNewDeposit }
            }));

            // Update UI
            await this.updateActivitiesList();
            await this.updateWalletDisplay();

        } catch (error) {
            console.error('Failed to transfer to holiday wallet:', error);
            this.modalManager.showError({
                sTitle: 'Transfer Failed',
                sContent: error.message || 'Unable to transfer activity to holiday wallet.'
            });
        }
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
     * @param {Activity} obActivity - Activity object
     * @returns {string} HTML string for activity item
     * @private
     */
    createActivityItem(obActivity) {
        const bIsCurrentlyUsed = this.trackingState.bIsUsingTime && 
                                this.trackingState.sCurrentUsageActivityId === obActivity.sId;
        const bIsFullyUsed = !obActivity.bIsAvailableForDeposit;
        
        return `
            <div class="flex items-center justify-between p-3 border-b ${bIsCurrentlyUsed ? 'bg-yellow-50' : ''}" 
                data-activity-id="${obActivity.sId}">
                <div class="flex-1">
                    <input type="text" 
                        class="w-full p-2 border rounded"
                        value="${obActivity.sDescription}"
                        placeholder="Enter activity description"
                        ${bIsFullyUsed ? 'disabled' : ''}>
                </div>
                <div class="flex items-center gap-2 ml-4">
                    <span class="font-medium">${DateTimeUtils.formatDuration(obActivity.nDuration)}</span>
                    ${obActivity.nUsedDuration > 0 ? 
                        `<span class="text-sm text-gray-500">
                            (${DateTimeUtils.formatDuration(obActivity.nUsedDuration)} used)
                        </span>` : 
                        ''}
                    ${!bIsFullyUsed ? `
                        <button 
                            class="transfer-to-holiday px-3 py-2 rounded bg-blue-100 hover:bg-blue-200 text-blue-600 
                                flex items-center gap-2 transition-colors duration-200"
                            data-action="transfer-to-holiday" 
                            data-activity-id="${obActivity.sId}">
                            <span>To Holiday</span>
                            <span class="text-lg">🏦</span>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
}