import { BasePage } from './BasePage.js';
import { HolidayWallet } from '../components/wallets/HolidayWallet.js';
import { TodayWallet } from '../components/wallets/TodayWallet.js';
import { stateManager } from '../services/StateManager.js';  // Import singleton instance
import { TimeCalculationService } from '../services/TimeCalculationService.js';
import { ModalManager } from '../components/modals/ModalManager.js';
import { ActivityTrackerTemplate } from '../components/templates/ActivityTrackerTemplate.js';
import { Constants } from '../utils/Constants.js';

/**
 * Page representing the wallet of a specific user
 */
export class WalletPage extends BasePage {
    /**
     * @param {string} sUserId - User ID whose wallet to display
     */
    constructor(sUserId) {
        super();
        this.sUserId = sUserId;
        console.log("sUserId:", this.sUserId);
        this.initialize();
    }

    /**
     * Initialize the wallet page
     * @private
     */
    async initialize() {
        const timeCalculationService = new TimeCalculationService();
        const modalManager = new ModalManager();
    
        // Ensure stateManager is initialized
        await stateManager.init();
    
        // Verify user exists
        const user = stateManager.getUser(this.sUserId);
        console.log("User after ensuring state load:", user);
        if (!user) {
            window.location.href = Constants.ROUTES.INDEX;
            return;
        }

        // Set current user in the state manager
        stateManager.setCurrentUserId(this.sUserId);

        // Check if the main container is already appended
        if (!document.getElementById('walletContainer')) {
            // Create page layout
            const template = new ActivityTrackerTemplate();
            const mainContainer = template.createLayout();
            mainContainer.id = 'walletContainer';  // Add unique ID to prevent duplication

            document.body.appendChild(mainContainer);
        }

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
