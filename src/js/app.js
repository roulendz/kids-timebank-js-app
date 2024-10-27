import { HomePage } from './pages/HomePage.js';
import { ChildrenListPage } from './pages/ChildrenListPage.js';
import { ChildFormPage } from './pages/ChildFormPage.js';
import { Constants } from './utils/Constants.js';

class TimebankApp {
    constructor() {
        this.initializeRouter();
    }

    /**
     * Initialize router
     * @private
     */
    initializeRouter() {
        // Get current path
        const sPath = window.location.pathname;
        
        // Route to appropriate page
        switch (sPath) {
            case Constants.ROUTES.INDEX:
                new HomePage();
                break;

            case Constants.ROUTES.CHILDREN:
                new ChildrenListPage();
                break;

            case Constants.ROUTES.CHILDREN_CREATE:
                new ChildFormPage(null); // null indicates create mode
                break;

            case Constants.ROUTES.DEPOSIT:
                // TODO: Implement DepositPage
                console.log('Deposit page not implemented yet');
                window.location.href = Constants.ROUTES.INDEX;
                break;

            case Constants.ROUTES.USE:
                // TODO: Implement UsePage
                console.log('Use page not implemented yet');
                window.location.href = Constants.ROUTES.INDEX;
                break;

            default:
                // Check if it's an edit route
                if (sPath.startsWith(Constants.ROUTES.CHILDREN_EDIT)) {
                    const sUserId = sPath.split('/').pop();
                    new ChildFormPage(sUserId);
                } else {
                    // Default to home page for unknown routes
                    window.location.href = Constants.ROUTES.INDEX;
                }
                break;
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TimebankApp();
});