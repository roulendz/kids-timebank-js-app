/**
 * @file src/js/app.js
 */
import { HomePage } from './pages/HomePage.js';
import { ChildrenListPage } from './pages/ChildrenListPage.js';
import { ChildFormPage } from './pages/ChildFormPage.js';
import { WalletPage } from './pages/WalletPage.js';
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
        const sPath = window.location.pathname;
    
        switch (true) {
            case sPath === Constants.ROUTES.INDEX:
                new HomePage();
                break;
    
            case sPath === Constants.ROUTES.CHILDREN:
                new ChildrenListPage();
                break;
    
            case sPath === Constants.ROUTES.CHILDREN_CREATE:
                new ChildFormPage(null);
                break;
    
            case sPath.startsWith(Constants.ROUTES.CHILDREN_WALLET):
                const walletUserId = sPath.split('/').pop();
                console.log("Navigating to Wallet for User ID:", walletUserId);
                new WalletPage(walletUserId); // Pass extracted userId to WalletPage
                break;
    
            case sPath.startsWith(Constants.ROUTES.CHILDREN_EDIT):
                const editUserId = sPath.split('/').pop();
                new ChildFormPage(editUserId);
                break;
    
            case sPath === Constants.ROUTES.DEPOSIT:
                console.log('Deposit page not implemented yet');
                window.location.href = Constants.ROUTES.INDEX;
                break;
    
            case sPath === Constants.ROUTES.USE:
                console.log('Use page not implemented yet');
                window.location.href = Constants.ROUTES.INDEX;
                break;
    
            default:
                window.location.href = Constants.ROUTES.INDEX;
                break;
        }
    }
    
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TimebankApp();
});