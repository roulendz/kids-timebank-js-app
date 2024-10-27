import { HomePage } from './pages/HomePage.js';
import { ChildrenPage } from './pages/ChildrenPage.js';
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
        // Get current path without domain and query parameters
        const sPath = window.location.pathname;
        
        console.log('Current path:', sPath); // For debugging
        
        // Route to appropriate page
        switch (sPath) {
            case Constants.ROUTES.CHILDREN:
                new ChildrenPage();
                break;
            case Constants.ROUTES.DEPOSIT:
                // TODO: Implement DepositPage
                console.log('Deposit page not implemented yet');
                break;
            case Constants.ROUTES.USE:
                // TODO: Implement UsePage
                console.log('Use page not implemented yet');
                break;
            case Constants.ROUTES.INDEX:
            case '/':    // Also handle root path
                new HomePage();
                break;
            default:
                console.log('Route not found, redirecting to home');
                window.location.href = Constants.ROUTES.INDEX;
                break;
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TimebankApp();
});