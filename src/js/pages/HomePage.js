/**
 * @file src/js/pages/HomePage.js
 */
import { BasePage } from './BasePage.js';
import { Constants } from '../utils/Constants.js';
import { stateManager } from '../services/StateManager.js';
import { WalletButton } from '../components/WalletButton.js';
import { AddWalletButton } from '../components/AddWalletButton.js';

/**
 * Home page with wallet selection
 */
export class HomePage extends BasePage {
    /**
     * @override
     */
    async render() {
        try {
            await this.initialize();

            const elContainer = document.createElement('div');
            elContainer.className = 'container mx-auto p-8';

            // Title
            const elTitle = document.createElement('h1');
            elTitle.className = 'text-4xl font-bold text-center mb-12';
            elTitle.textContent = 'TimeBank Kids';
            elContainer.appendChild(elTitle);

            // Wallets container
            const elWalletsContainer = document.createElement('div');
            elWalletsContainer.className = 'flex flex-wrap justify-center gap-8';

            // Add user wallets
            const arUsers = stateManager.getUsers();
            arUsers.forEach(obUser => {
                const obWalletButton = new WalletButton(obUser, (sUserId) => {
                    window.location.href = `${Constants.ROUTES.CHILDREN_WALLET}/${sUserId}`;
                });
                elWalletsContainer.appendChild(obWalletButton.element);
            });

            // Add the "+" button
            const obAddButton = new AddWalletButton(() => {
                window.location.href = Constants.ROUTES.CHILDREN;
            });
            elWalletsContainer.appendChild(obAddButton.element);

            elContainer.appendChild(elWalletsContainer);
            document.getElementById('content').appendChild(elContainer);
        } catch (error) {
            console.error('Error rendering HomePage:', error);
        }
    }
}