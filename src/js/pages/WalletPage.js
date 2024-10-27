/**
 * @file src/js/pages/WalletPage.js
 */
import { BasePage } from './BasePage.js';
import { HolidayWallet } from '../components/wallets/HolidayWallet.js';
import { TodayWallet } from '../components/wallets/TodayWallet.js';
import { stateManager } from '../services/StateManager.js';
import { TimeCalculationService } from '../services/TimeCalculationService.js';
import { ModalManager } from '../components/modals/ModalManager.js';
import { ActivityTrackerTemplate } from '../components/templates/ActivityTrackerTemplate.js';

export class WalletPage extends BasePage {
    /**
     * @param {string} sUserId - User ID whose wallet to display
     */
    constructor(sUserId) {
        super();
        this.sUserId = sUserId;
        this.initialize();
    }

    /**
     * Initialize the wallet page
     * @private
     */
    async initialize() {
        // Initialize services
        const stateManager = new StateManager();
        const timeCalculationService = new TimeCalculationService();
        const modalManager = new ModalManager();

        // Verify user exists
        const user = stateManager.getUser(this.sUserId);
        if (!user) {
            window.location.href = Constants.ROUTES.INDEX;
            return;
        }

        // Set current user
        stateManager.setCurrentUserId(this.sUserId);

        // Create page layout
        const template = new ActivityTrackerTemplate();
        const mainContainer = template.createLayout();
        
        // Add user info header
        const userHeader = document.createElement('div');
        userHeader.className = 'bg-white shadow-sm p-4 mb-6 rounded-lg';
        userHeader.innerHTML = `
            <h1 class="text-2xl font-bold">${user.sName}'s Wallet</h1>
            <p class="text-gray-600">Manage time and activities</p>
        `;
        mainContainer.insertBefore(userHeader, mainContainer.firstChild);

        document.getElementById('app').appendChild(mainContainer);

        // Initialize wallet components
        this.todayWallet = new TodayWallet(
            stateManager,
            timeCalculationService,
            modalManager
        );

        this.holidayWallet = new HolidayWallet(
            stateManager,
            timeCalculationService,
            modalManager
        );
    }
}