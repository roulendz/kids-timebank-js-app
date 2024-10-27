/**
 * @file TodayWallet.js
 * Manages the today's wallet functionality including activity tracking and time calculations
 */

import { TimeTrackingState, Activity, TimeDeposit, DepositStatus, WalletType } from '../types/Types';
import { StateManager } from '../services/StateManager';
import { DateTimeUtils } from '../utils/DateTimeUtils';
import { TimeCalculationService } from '../services/TimeCalculationService';

export class TodayWallet {
    /**
     * @param {StateManager} stateManager
     * @param {TimeCalculationService} timeCalculationService
     */
    constructor(stateManager, timeCalculationService) {
        this.stateManager = stateManager;
        this.timeCalculationService = timeCalculationService;
        
        /** @type {TimeTrackingState} */
        this.trackingState = {
            bIsTracking: false,
            nStartTime: null,
            sCurrentActivityDescription: ''
        };

        this.timerInterval = null;
        this.initializeElements();
        this.bindEvents();
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
    }

    /**
     * Bind event listeners
     * @private
     */
    bindEvents() {
        this.startButton.addEventListener('click', () => this.startTracking());
        this.stopButton.addEventListener('click', () => this.stopTracking());
    }

    /**
     * Start activity tracking
     * @private
     */
    startTracking() {
        this.trackingState.bIsTracking = true;
        this.trackingState.nStartTime = Date.now();
        
        // Update UI
        this.startButtonContainer.classList.add('hidden');
        this.timerContainer.classList.remove('hidden');
        
        // Start timer
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
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
            sId: crypto.randomUUID(),
            sType: 'work',
            sDescription: this.trackingState.sCurrentActivityDescription || 'Unnamed activity',
            nStartTime: this.trackingState.nStartTime,
            nEndTime: endTime,
            nDuration: duration,
            sUserId: this.stateManager.getCurrentUserId()
        };

        // Create time deposit
        /** @type {TimeDeposit} */
        const deposit = {
            sId: crypto.randomUUID(),
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

        // Update UI
        this.timerContainer.classList.add('hidden');
        this.startButtonContainer.classList.remove('hidden');
        this.updateActivitiesList();
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