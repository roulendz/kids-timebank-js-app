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
        this.initialize();
    }

    /**
     * Initialize the wallet page
     * @protected
     */
    async initialize() {
        // First call parent initialization
        await super.initialize();

        const timeCalculationService = new TimeCalculationService();
        const modalManager = new ModalManager();

        try {
            // Ensure stateManager is initialized
            await stateManager.init();

            // Verify user exists
            const user = stateManager.getUser(this.sUserId);
            if (!user) {
                window.location.href = Constants.ROUTES.INDEX;
                return;
            }

            // Set current user in the state manager
            stateManager.setCurrentUserId(this.sUserId);

            // Get user's activities for today
            const activities = await stateManager.getActivities(this.sUserId) || [];
            const todayActivities = activities.filter(activity => {
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                return activity.nStartTime >= todayStart.getTime();
            });

            // Create and append the template first
            const template = new ActivityTrackerTemplate(this.sUserId);
            const mainContainer = template.createLayout(todayActivities);
            mainContainer.id = 'walletContainer';

            const content = document.getElementById('content');
            if (content) {
                content.appendChild(mainContainer);
            } else {
                document.body.appendChild(mainContainer);
            }

            // Wait for next frame to ensure DOM is updated
            await new Promise(resolve => requestAnimationFrame(resolve));

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
        } catch (error) {
            console.error('Failed to initialize WalletPage:', error);
        }
    }
}
