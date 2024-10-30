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
    async initializeRouter() {
        const sPath = window.location.pathname;

        try {
            switch (true) {
                case sPath === Constants.ROUTES.INDEX:
                    console.log('Navigating to HomePage');
                    const homePage = new HomePage();
                    await homePage.render();
                    break;

                case sPath === Constants.ROUTES.CHILDREN:
                    console.log('Navigating to ChildrenListPage');
                    const childrenListPage = new ChildrenListPage();
                    await childrenListPage.render();
                    break;

                case sPath === Constants.ROUTES.CHILDREN_CREATE:
                    console.log('Navigating to ChildFormPage (create)');
                    const childFormPage = new ChildFormPage(null);
                    await childFormPage.render();
                    break;

                case sPath.startsWith(Constants.ROUTES.CHILDREN_WALLET):
                    const walletUserId = sPath.split('/').pop();
                    console.log("Navigating to WalletPage for User ID:", walletUserId);
                    new WalletPage(walletUserId); // Pass extracted userId to WalletPage
                    break;

                case sPath.startsWith(Constants.ROUTES.CHILDREN_EDIT):
                    const editUserId = sPath.split('/').pop();
                    console.log('Navigating to ChildFormPage (edit)');
                    new ChildFormPage(editUserId);
                    break;

                case sPath === Constants.ROUTES.DEPOSIT:
                    console.log('Navigating to Deposit page (not implemented yet)');
                    window.location.href = Constants.ROUTES.INDEX;
                    break;

                case sPath === Constants.ROUTES.USE:
                    console.log('Navigating to Use page (not implemented yet)');
                    window.location.href = Constants.ROUTES.INDEX;
                    break;

                default:
                    console.log('Navigating to default (HomePage)');
                    window.location.href = Constants.ROUTES.INDEX;
                    break;
            }
        } catch (error) {
            console.error('Error in initializeRouter:', error);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TimebankApp();
});