/**
 * @file src/js/components/wallets/HolidayWallet.js
 * Holiday wallet component that manages holiday time deposits and bonus calculations
 */

/** @typedef {import('../../types/Types.js').TimeDeposit} TimeDeposit */
/** @typedef {import('../../types/Types.js').UserSettings} UserSettings */
/** @typedef {import('../../types/Types.js').HTMLElementWithData} HTMLElementWithData */

import { WalletType, DepositStatus } from '../../types/Types.js';

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
        this.deposits = [];
        
        /** @type {UserSettings|null} */
        this.userSettings = null;

        // Defer initialization to ensure DOM is ready
        requestAnimationFrame(() => this.initialize());
    }


     /**
     * Initialize the wallet component
     * @private
     */
     async initialize() {
        try {
            await this._initializeElements();
            if (this._allElementsExist()) {
                this._bindEvents();
                await this._loadUserSettings();
                await this.updateDisplay();
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
     async _initializeElements() {
        this.container = document.getElementById('holidayWallet');
        this.contentContainer = document.getElementById('holidayWalletContent');
        this.totalDisplay = document.getElementById('holidayTotal');
        this.weekendBonus = document.getElementById('weekendBonus');
        this.infoButton = document.getElementById('holidayInfo');
    }

    /**
     * Check if all required elements exist
     * @private
     * @returns {boolean}
     */
    _allElementsExist() {
        const requiredElements = [
            this.contentContainer,
            this.totalDisplay,
            this.infoButton
        ];
        return requiredElements.every(element => element !== null);
    }

    /**
     * Bind event listeners with error handling
     * @private
     */
    _bindEvents() {
        if (this.infoButton) {
            this.infoButton.addEventListener('click', () => this._showInfoModal());
        }
        
        // Custom events
        document.addEventListener('depositAdded', () => this.updateDisplay());
        document.addEventListener('depositCanceled', () => this.updateDisplay());
        
        // Delegate events for deposit items
        if (this.contentContainer) {
            this.contentContainer.addEventListener('click', (e) => {
                const obTarget = /** @type {HTMLElementWithData} */ (e.target);
                const cancelButton = obTarget.closest('.cancel-deposit');
                if (cancelButton) {
                    const depositId = /** @type {HTMLElementWithData} */ (cancelButton).dataset.depositId;
                    if (depositId) {
                        this._handleCancelDeposit(depositId);
                    }
                }
            });
        }
    }

    /**
     * Load user settings
     * @private
     * @async
     */
    async _loadUserSettings() {
        const userId = this.stateManager.getCurrentUserId();
        this.userSettings = await this.stateManager.getUserSettings(userId);
    }

    /**
     * Update holiday wallet display
     * @public
     * @async
     */
    async updateDisplay() {
        this.deposits = await this._getHolidayDeposits();
        this._updateDepositsList();
        this._updateTotalTime();
        this._updateWeekendBonus();
    }

    /**
     * Get holiday wallet deposits
     * @private
     * @async
     * @returns {Promise<TimeDeposit[]>}
     */
    async _getHolidayDeposits() {
        const userId = this.stateManager.getCurrentUserId();
        const allDeposits = await this.stateManager.getDeposits(userId);
        return allDeposits.filter(deposit => 
            deposit.sWalletType === WalletType.HOLIDAY &&
            deposit.sStatus === DepositStatus.HOLIDAY_DEPOSITED
        );
    }

    /**
     * Create HTML for a deposit item
     * @private
     * @param {TimeDeposit} deposit
     * @returns {string}
     */
    _createDepositItem(deposit) {
        const totalTime = deposit.nDepositedTime + deposit.nBonusTime;
        const bonusPercentage = (deposit.nBonusTime / deposit.nDepositedTime * 100).toFixed(1);
        const activity = this.stateManager.getActivity(deposit.sActivityId);

        return `
            <div class="bg-white rounded-lg shadow p-4 mb-4" data-deposit-id="${deposit.sId}">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex-1">
                        <h3 class="font-medium text-gray-900">${activity?.sDescription || 'Activity'}</h3>
                        <p class="text-sm text-gray-500">Week ${deposit.nWeekNumber}, ${deposit.nYear}</p>
                    </div>
                    <button class="cancel-deposit p-2 rounded-full hover:bg-red-50 text-red-600"
                            title="Cancel deposit">
                        ❌
                    </button>
                </div>
                <div class="grid grid-cols-3 gap-2 text-sm">
                    <div class="text-gray-600">
                        <div>Deposited:</div>
                        <div class="font-medium">${this._formatDuration(deposit.nDepositedTime)}</div>
                    </div>
                    <div class="text-green-600">
                        <div>Bonus:</div>
                        <div class="font-medium">+${bonusPercentage}%</div>
                    </div>
                    <div class="text-blue-600">
                        <div>Total:</div>
                        <div class="font-medium">${this._formatDuration(totalTime)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Format duration in milliseconds to human-readable string
     * @private
     * @param {number} duration - Duration in milliseconds
     * @returns {string}
     */
    _formatDuration(duration) {
        const hours = Math.floor(duration / 3600000);
        const minutes = Math.floor((duration % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    }

    /**
     * Update deposits list in the UI
     * @private
     */
    _updateDepositsList() {
        this.contentContainer.innerHTML = this.deposits.length
            ? this.deposits.map(deposit => this._createDepositItem(deposit)).join('')
            : `<div class="text-center text-gray-500 py-8">
                 No holiday time deposits yet
               </div>`;
    }

    /**
     * Update total time display
     * @private
     */
    _updateTotalTime() {
        const totalTime = this.deposits.reduce((sum, deposit) => 
            sum + deposit.nDepositedTime + deposit.nBonusTime, 0);
        this.totalDisplay.textContent = this._formatDuration(totalTime);
    }

    /**
     * Update weekend bonus display
     * @private
     */
    _updateWeekendBonus() {
        if (!this.userSettings?.bWeekendTimeToNextWeek) return;
        
        const weekendTotal = this.timeCalculationService.calculateWeekendBonus(
            this.deposits,
            this.userSettings.nWeeklyBonusPercentage
        );
        
        this.weekendBonus.textContent = 
            `Potential Weekend Bonus: ${this._formatDuration(weekendTotal)}`;
    }

    /**
     * Handle deposit cancellation
     * @private
     * @async
     * @param {string} depositId
     */
    async _handleCancelDeposit(depositId) {
        const deposit = this.deposits.find(d => d.sId === depositId);
        if (!deposit) return;

        const bonusTime = deposit.nBonusTime;
        const formattedBonus = this._formatDuration(bonusTime);

        const confirmed = await this.modalManager.showConfirmation({
            sTitle: 'Cancel Holiday Deposit?',
            sContent: `
                <p>Are you sure you want to cancel this holiday deposit?</p>
                <p class="text-red-600 mt-2">
                    You will lose ${formattedBonus} of bonus time!
                </p>
            `
        });

        if (confirmed) {
            await this.stateManager.updateDeposit({
                ...deposit,
                sStatus: DepositStatus.USED,
                sWalletType: WalletType.TODAY
            });
            this.updateDisplay();
        }
    }

    /**
     * Show holiday wallet information modal
     * @private
     */
    _showInfoModal() {
        this.modalManager.showInfo({
            sTitle: 'Holiday Wallet Information',
            sContent: `
                <div class="space-y-4">
                    <p>The Holiday Wallet lets you save activity time for use during holidays!</p>
                    <ul class="list-disc pl-5 space-y-2">
                        <li>Deposit your daily activities to earn bonus time</li>
                        <li>Earn ${this.userSettings?.nHolidayBonusPercentage}% bonus on deposits</li>
                        <li>Get extra ${this.userSettings?.nWeeklyBonusPercentage}% for full week deposits</li>
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