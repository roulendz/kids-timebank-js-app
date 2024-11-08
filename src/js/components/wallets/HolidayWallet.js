/**
 * @file src/js/components/wallets/HolidayWallet.js
 * Holiday wallet component that manages holiday time deposits and bonus calculations
 */

/** @typedef {import('../../types/Types.js').TimeDeposit} TimeDeposit */
/** @typedef {import('../../types/Types.js').UserSettings} UserSettings */
/** @typedef {import('../../types/Types.js').HTMLElementWithData} HTMLElementWithData */
/** @typedef {import('../../types/Types.js').Activity} Activity */

import { DateTimeUtils } from '../../utils/DateTimeUtils.js';

/**
 * Manages holiday wallet functionality including deposits, bonuses, and display
 */
export class HolidayWallet {
    /**
     * @param {Object} stateManager - State management service
     * @param {Object} timeCalculationService - Time calculation service
     * @param {Object} modalManager - Modal management service
     */
    constructor(stateManager, timeCalculationService, modalManager) {
        this.stateManager = stateManager;
        this.timeCalculationService = timeCalculationService;
        this.modalManager = modalManager;
        
        /** @type {TimeDeposit[]} */
        this.arDeposits = [];
        
        /** @type {Map<string, Activity>} */
        this.mapDepositsActivities = new Map();
        
        /** @type {UserSettings|null} */
        this.obUserSettings = null;

        // Defer initialization to ensure DOM is ready
        requestAnimationFrame(() => this.initializeHolidayWallet());
    }

    /**
     * Initialize the wallet component
     * @private
     */
    async initializeHolidayWallet() {
        try {
            await this.initializeWalletElements();
            if (this.checkRequiredElements()) {
                this.bindWalletEvents();
                await this.loadHolidaySettings();
                await this.refreshHolidayDisplay();
            } else {
                console.warn('Holiday wallet: Some required elements are missing');
            }
        } catch (error) {
            console.error('Failed to initialize HolidayWallet:', error);
        }
    }

    /**
     * Initialize DOM elements
     * @private
     * @returns {Promise<void>}
     */
    async initializeWalletElements() {
        this.obContainer = document.getElementById('holidayWallet');
        this.obContentContainer = document.getElementById('holidayWalletContent');
        this.obTotalDisplay = document.getElementById('holidayTotal');
        this.obWeekendBonus = document.getElementById('weekendBonus');
        this.obInfoButton = document.getElementById('holidayInfo');
    }

    /**
     * Load and cache all deposits related activities
     * @private
     * @returns {Promise<void>}
     */
    async loadDepositsActivities() {
        const sUserId = this.stateManager.getCurrentUserId();
        const arActivities = await this.stateManager.getActivities(sUserId);
        this.mapDepositsActivities.clear();
        arActivities.forEach(obActivity => {
            this.mapDepositsActivities.set(obActivity.sId, obActivity);
        });
    }

    /**
     * Check if all required elements exist
     * @private
     * @returns {boolean}
     */
    checkRequiredElements() {
        const arRequiredElements = [
            this.obContentContainer,
            this.obTotalDisplay,
            this.obInfoButton
        ];
        return arRequiredElements.every(element => element !== null);
    }

    /**
     * Bind event listeners
     * @private
     */
    bindWalletEvents() {
        if (this.obInfoButton) {
            this.obInfoButton.addEventListener('click', () => this.showHolidayInfoModal());
        }
        
        // Custom events
        document.addEventListener('depositAdded', () => this.refreshHolidayDisplay());
        document.addEventListener('depositCanceled', () => this.refreshHolidayDisplay());
        
        // Delegate events for deposit items
        if (this.obContentContainer) {
            this.obContentContainer.addEventListener('click', (e) => {
                const obTarget = /** @type {HTMLElementWithData} */ (e.target);
                const obCancelButton = obTarget.closest('.cancel-deposit');
                if (obCancelButton) {
                    const sDepositId = /** @type {HTMLElementWithData} */ (obCancelButton).dataset.depositId;
                    if (sDepositId) {
                        this.handleCancelDeposit(sDepositId);
                    }
                }
            });
        }
    }

    /**
     * Load user holiday settings
     * @private
     * @async
     */
    async loadHolidaySettings() {
        const sUserId = this.stateManager.getCurrentUserId();
        this.obUserSettings = await this.stateManager.getUserSettings(sUserId);
    }

    /**
     * Update holiday wallet display
     * @public
     * @async
     */
    async refreshHolidayDisplay() {
        this.arDeposits = await this.getHolidayDeposits();
        await this.loadDepositsActivities();
        this.refreshDepositsList();
        this.refreshTotalTime();
        this.refreshWeekendBonus();
    }

    /**
     * Get holiday wallet deposits
     * @private
     * @async
     * @returns {Promise<TimeDeposit[]>}
     */
    async getHolidayDeposits() {
        const sUserId = this.stateManager.getCurrentUserId();
        const arAllDeposits = await this.stateManager.getDeposits(sUserId);
        return arAllDeposits;
    }

    /**
     * Create HTML for a deposit item
     * @private
     * @param {TimeDeposit} obDeposit
     * @returns {string}
     */
    createDepositItemHtml(obDeposit) {
        // Only use new TimeDeposit structure fields
        const nTotalTime = obDeposit.nDepositedDuration + obDeposit.nAccumulatedBonus;
        const nBonusPercentage = (obDeposit.nAccumulatedBonus / obDeposit.nDepositedDuration * 100).toFixed(1);
        const dDepositDate = new Date(obDeposit.nDepositTimestamp);

        return `
            <div class="bg-white rounded-lg shadow p-4 mb-4" data-deposit-id="${obDeposit.sId}">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex-1">
                        <h3 class="font-medium text-gray-900">
                            ${obDeposit.sDescription}
                        </h3>
                        <p class="text-sm text-gray-500">
                            Deposited on ${dDepositDate.toLocaleDateString()} at ${dDepositDate.toLocaleTimeString()}
                        </p>
                        <p class="text-sm text-gray-500">Week ${obDeposit.nWeekNumber}, ${obDeposit.nYear}</p>
                    </div>
                    ${obDeposit.bIsAvailableForDeposit ? `
                        <button class="cancel-deposit p-2 rounded-full hover:bg-red-50 text-red-600"
                                data-deposit-id="${obDeposit.sId}"
                                title="Cancel deposit">
                            ❌
                        </button>
                    ` : ''}
                </div>
                <div class="grid grid-cols-3 gap-2 text-sm mt-2">
                    <div class="text-gray-600">
                        <div>Deposited:</div>
                        <div class="font-medium">${DateTimeUtils.formatDuration(obDeposit.nDepositedDuration)}</div>
                    </div>
                    <div class="text-green-600">
                        <div>Bonus:</div>
                        <div class="font-medium">+${nBonusPercentage}% (${DateTimeUtils.formatDuration(obDeposit.nAccumulatedBonus)})</div>
                    </div>
                    <div class="text-blue-600">
                        <div>Total:</div>
                        <div class="font-medium">${DateTimeUtils.formatDuration(nTotalTime)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Update deposits list in the UI
     * @private
     */
    refreshDepositsList() {
        if (!this.obContentContainer) return;

        const arSortedDeposits = [...this.arDeposits].sort((a, b) => 
            b.nDepositTimestamp - a.nDepositTimestamp
        );

        this.obContentContainer.innerHTML = arSortedDeposits.length
            ? arSortedDeposits.map(obDeposit => this.createDepositItemHtml(obDeposit)).join('')
            : `<div class="text-center text-gray-500 py-8">
                 No holiday time deposits yet
               </div>`;
    }

    /**
     * Update total time display
     * @private
     */
    refreshTotalTime() {
        if (!this.obTotalDisplay) return;

        const nTotalTime = this.arDeposits.reduce((nSum, obDeposit) => 
            nSum + obDeposit.nDepositedDuration + obDeposit.nAccumulatedBonus, 0);
        this.obTotalDisplay.textContent = DateTimeUtils.formatDuration(nTotalTime);
    }

    /**
     * Update weekend bonus display
     * @private
     */
    refreshWeekendBonus() {
        if (!this.obUserSettings?.bWeekendTimeToNextWeek || !this.obWeekendBonus) return;
        
        const nWeekendTotal = this.timeCalculationService.calculateWeekendBonus(
            this.arDeposits
        );
        
        this.obWeekendBonus.textContent = 
            `Potential Weekend Bonus: ${DateTimeUtils.formatDuration(nWeekendTotal)}`;
    }

    /**
     * Handle deposit cancellation
     * @private
     * @async
     * @param {string} sDepositId
     */
    async handleCancelDeposit(sDepositId) {
        try {
            const obDeposit = this.arDeposits.find(d => d.sId === sDepositId);
            if (!obDeposit) return;

            const nBonusTime = obDeposit.nAccumulatedBonus;
            const sFormattedBonus = DateTimeUtils.formatDuration(nBonusTime);

            const bConfirmed = await this.modalManager.showConfirmation({
                sTitle: 'Transfare Holiday Deposit?',
                sContent: `
                    <p>Are you sure you want to transfare back this holiday deposit for use today?</p>
                    <p class="text-red-600 mt-2">
                        You will lose ${sFormattedBonus} of bonus time!
                    </p>
                `
            });

            if (bConfirmed) {
                const sUserId = this.stateManager.getCurrentUserId();
                const obUser = await this.stateManager.getUser(sUserId);
                
                if (!obUser) {
                    throw new Error('User not found');
                }

                // Create activity from deposit
                /** @type {Activity} */
                const obNewActivity = {
                    sId: obDeposit.sId,
                    sDescription: obDeposit.sDescription,
                    nStartTime: obDeposit.nStartTime,
                    nEndTime: obDeposit.nEndTime,
                    nDuration: obDeposit.nDuration,
                    nUsedDuration: obDeposit.nUsedDuration || 0,
                    bIsAvailableForDeposit: true,
                    sUserId: sUserId,
                    nWeekNumber: obDeposit.nWeekNumber,
                    nYear: obDeposit.nYear
                };

                // Remove from deposits
                obUser.arDeposits = obUser.arDeposits.filter(obDep => obDep.sId !== sDepositId);

                // Add to activity log
                if (!obUser.arActivityLog) {
                    obUser.arActivityLog = [];
                }
                obUser.arActivityLog.push(obNewActivity);

                // Update user state
                await this.stateManager.updateUser(obUser);

                // Refresh both holiday and activity displays
                await this.refreshHolidayDisplay();
                // Dispatch event to notify TodayWallet to refresh activities
                document.dispatchEvent(new CustomEvent('activityListChanged'));

                // Show success message
                this.modalManager.showSuccess({
                    sTitle: 'Deposit transfared to Activity list',
                    sContent: 'Activity has been returned and you can use your time today.'
                });
            }
        } catch (error) {
            console.error('Failed to cancel deposit:', error);
            this.modalManager.showError({
                sTitle: 'Cancellation Failed',
                sContent: error.message || 'Unable to cancel the deposit.'
            });
        }
    }

    /**
     * Show holiday wallet information modal
     * @private
     */
    showHolidayInfoModal() {
        this.modalManager.showInfo({
            sTitle: 'Holiday Wallet Information',
            sContent: `
                <div class="space-y-4">
                    <p>The Holiday Wallet lets you save activity time for use during holidays!</p>
                    <ul class="list-disc pl-5 space-y-2">
                        <li>Deposit your daily activities to earn bonus time</li>
                        <li>Earn ${this.obUserSettings?.nHolidayBonusPercentage}% bonus on deposits</li>
                        <li>Get extra ${this.obUserSettings?.nWeeklyBonusPercentage}% for full week deposits</li>
                        <li>Weekend deposits can be saved for next week</li>
                    </ul>
                    <p class="text-sm text-gray-600">
                        Note: Canceling deposits will forfeit any earned bonus time
                    </p>
                </div>
            `
        });
    }
}