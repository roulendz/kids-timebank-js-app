import { ChildForm } from '../components/ChildForm.js';
import { stateManager } from '../services/StateManager.js';
import { Constants } from '../utils/Constants.js';

/**
 * Children management page
 */
export class ChildrenPage {
    constructor() {
        this.initialize();
    }

    /**
     * Initialize the page
     * @private
     */
    initialize() {
        document.body.style.backgroundColor = Constants.COLORS.BACKGROUND;
        this.render();
    }

    /**
     * Render page content
     * @private
     */
    render() {
        const elContainer = document.createElement('div');
        elContainer.className = 'container mx-auto p-8';

        // Header with back button
        const elHeader = document.createElement('div');
        elHeader.className = 'flex items-center mb-8';

        const elBackButton = document.createElement('button');
        elBackButton.className = `
            mr-4 p-2 
            rounded-full 
            hover:bg-purple-100
            transition-colors
        `;
        elBackButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
        `;
        elBackButton.addEventListener('click', () => {
            window.location.href = Constants.ROUTES.INDEX;
        });

        const elTitle = document.createElement('h1');
        elTitle.className = 'text-3xl font-bold';
        elTitle.textContent = 'Manage Time Wallets';

        elHeader.appendChild(elBackButton);
        elHeader.appendChild(elTitle);
        elContainer.appendChild(elHeader);

        // Add user form
        const obChildForm = new ChildForm((obData) => {
            if (obData.sId) {
                // Update existing user
                stateManager.updateUser(obData);
            } else {
                // Add new user
                stateManager.addUser(obData.sName, obData.sNickname, obData.arSchedule);
            }
            window.location.href = Constants.ROUTES.INDEX;
        });

        elContainer.appendChild(obChildForm.element);
        document.body.appendChild(elContainer);
    }
}