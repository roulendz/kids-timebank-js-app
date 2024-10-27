/**
 * @file src/js/components/wallets/HolidayWallet.js
 * Holiday wallet component that manages holiday time deposits and bonus calculations
 */

import { TimeDeposit, DepositStatus, WalletType, UserSettings } from '../../types/Types.js';
import { StateManager } from '../../services/StateManager.js';
import { TimeCalculationService } from '../../services/TimeCalculationService.js';
import { DateTimeUtils } from '../../utils/DateTimeUtils.js';
import { ModalManager } from '../modals/ModalManager.js';

/**
 * Manages holiday wallet functionality including deposits, bonuses, and display
 */
export class HolidayWallet {
    /**
     * @param {StateManager} stateManager
     * @param {TimeCalculationService} timeCalculationService
     * @param {ModalManager} modalManager
     */
    constructor(stateManager, timeCalculationService, modalManager) {
        this.stateManager = stateManager;
        this.timeCalculationService = timeCalculationService;
        this.modalManager = modalManager;
        
        /** @type {TimeDeposit[]} */
        this.deposits = [];
        
        /** @type {UserSettings|null} */
        this.userSettings = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadUserSettings();
        this.updateDisplay();
    }

    /**
     * Initialize DOM elements
     * @private
     */
    _initializeElements() {
        this.container = document.getElementById('holidayWallet');
        this.contentContainer = document.getElementById('holidayWalletContent');
        this.totalDisplay = document.getElementById('holidayTotal');
        this.weekendBonus = document.getElementById('weekendBonus');
        this.infoButton = document.getElementById('holidayInfo');
    }

    /**
     * Bind event listeners
     * @private
     */
    _bindEvents() {
        this.infoButton.addEventListener('click', () => this._showInfoModal());
        
        // Listen for deposit updates from other components
        document.addEventListener('depositAdded', () => this.updateDisplay());
        document.addEventListener('depositCanceled', () => this.updateDisplay());
        
        // Delegate event listeners for deposit items
        this.contentContainer.addEventListener('click', (e) => {
            const cancelButton = e.target.closest('.cancel-deposit');
            if (cancelButton) {
                const depositId = cancelButton.closest('[data-deposit-id]').dataset.depositId;
                this._handleCancelDeposit(depositId);
            }
        });
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
     * @private
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
                        <div class="font-medium">${DateTimeUtils.formatDuration(deposit.nDepositedTime)}</div>
                    </div>
                    <div class="text-green-600">
                        <div>Bonus:</div>
                        <div class="font-medium">+${bonusPercentage}%</div>
                    </div>
                    <div class="text-blue-600">
                        <div>Total:</div>
                        <div class="font-medium">${DateTimeUtils.formatDuration(totalTime)}</div>
                    </div>
                </div>
            </div>
        `;
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
        this.totalDisplay.textContent = DateTimeUtils.formatDuration(totalTime);
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
            `Potential Weekend Bonus: ${DateTimeUtils.formatDuration(weekendTotal)}`;
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
        const formattedBonus = DateTimeUtils.formatDuration(bonusTime);

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