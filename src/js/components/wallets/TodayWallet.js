/**
 * @file src/js/components/wallets/TodayWallet.js
 * Manages the today's wallet functionality including activity tracking and time calculations
 */

// Import types and enums - make sure paths match your project structure
import { WalletType, DepositStatus } from '../../types/Types.js';
import { generateId } from '../../utils/IdUtils.js';
import { WalletCalculationService } from '../../services/WalletCalculationService.js';

// Use JSDoc imports for complex types
/** @typedef {import('../../types/Types.js').TimeTrackingState} TimeTrackingState */
/** @typedef {import('../../types/Types.js').Activity} Activity */
/** @typedef {import('../../types/Types.js').TimeDeposit} TimeDeposit */

// Import services
import { stateManager } from '../../services/StateManager.js';
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

        // Initialize state and bind events as necessary
        this.trackingState = {
            bIsTracking: false,
            nStartTime: null,
            sCurrentActivityDescription: ''
        };

        this.timerInterval = null;
        this.initializeElements();
        this.bindEvents();
        this.loadTrackingState();
        this.updateActivitiesList();
        this.updateWalletDisplay();
    }

    /**
     * Initialize DOM elements
     * @private
     */
    initializeElements() {
        this.startButton = document.getElementById('startTracking');
        this.stopButton = document.getElementById('stopTracking');
        this.timerElement = document.getElementById('timer');
        this.startButtonContainer = document.getElementById('startButtonContainer');
        this.timerContainer = document.getElementById('timerContainer');
        this.activitiesList = document.getElementById('activitiesList');
        this.todayTotal = document.getElementById('todayTotal');
        this.todayWalletContent = document.getElementById('todayWalletContent');
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
        const totalAvailable = this.walletCalculationService.calculateTodayWalletBalance(deposits);
        if (this.todayTotal) {
            this.todayTotal.textContent = DateTimeUtils.formatDuration(totalAvailable);
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
        if (deposits.length === 0) {
            return '<div class="text-center text-gray-500 py-4">No deposits yet today</div>';
        }

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

        // Create activity record
        /** @type {Activity} */
        const activity = {
            sId: generateId(),
            sDescription: this.trackingState.sCurrentActivityDescription || 'Unnamed activity',
            nStartTime: this.trackingState.nStartTime,
            nEndTime: endTime,
            nDuration: duration,
            sUserId: this.stateManager.getCurrentUserId()
        };

        // Create time deposit
        /** @type {TimeDeposit} */
        const deposit = {
            sId: generateId(),
            sUserId: activity.sUserId,
            sActivityId: activity.sId,
            sWalletType: WalletType.TODAY,
            sStatus: DepositStatus.PENDING,
            nDepositedTime: duration,
            nBonusTime: 0,
            nDepositTimestamp: Date.now(),
            nWeekNumber: this.timeCalculationService.calculateWeekNumber(new Date()),
            nYear: new Date().getFullYear()
        };

        // Save records
        await this.stateManager.addActivity(activity);
        await this.stateManager.addDeposit(deposit);

        // Reset tracking state
        clearInterval(this.timerInterval);
        this.trackingState.bIsTracking = false;
        this.trackingState.nStartTime = null;
        this.trackingState.sCurrentActivityDescription = '';

        // Save cleared state
        await this.saveTrackingState();

        // Update UI
        this.timerContainer.classList.add('hidden');
        this.startButtonContainer.classList.remove('hidden');
        this.updateActivitiesList();
        await this.updateWalletDisplay();
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
        return `
            <div class="flex items-center justify-between p-3 border-b" data-activity-id="${activity.sId}">
                <div class="flex-1">
                    <input type="text" 
                           class="w-full p-2 border rounded"
                           value="${activity.sDescription}"
                           placeholder="Enter activity description">
                </div>
                <div class="flex items-center gap-2 ml-4">
                    <span class="font-medium">${DateTimeUtils.formatDuration(activity.nDuration)}</span>
                    <button class="deposit-holiday p-2 rounded bg-blue-100 text-blue-600">
                        <span class="sr-only">Deposit to Holiday Wallet</span>
                        🏦
                    </button>
                    <button class="info-button p-2 rounded bg-gray-100">
                        <span class="sr-only">Information</span>
                        ℹ️
                    </button>
                </div>
            </div>
        `;
    }
}