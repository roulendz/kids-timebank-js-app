/**
 * @typedef {import('../types/Types').User} User
 */

import { BasePage } from './BasePage.js';
import { Constants } from '../utils/Constants.js';
import { stateManager } from '../services/StateManager.js';

/**
 * Page component for managing children's time wallets
 * Lists all children, allows adding new ones, editing and deleting existing ones
 * @extends BasePage
 */
export class ChildrenListPage extends BasePage {
    /**
     * Renders the children list page content
     * Creates container, header, add button and list of children
     * @override
     * @returns {void}
     */
    render() {
        const elContainer = document.createElement('div');
        elContainer.className = 'container mx-auto p-8';

        // Header with back button
        const elHeader = this.createHeader();
        elContainer.appendChild(elHeader);

        // Add button
        const elAddButton = this.createAddButton();
        elContainer.appendChild(elAddButton);

        // Children list
        const elListContainer = this.createChildrenList();
        elContainer.appendChild(elListContainer);

        document.body.appendChild(elContainer);
    }

    /**
     * Creates the page header with back button and title
     * @private
     * @returns {HTMLElement} Header element with back button and title
     */
    createHeader() {
        const elHeader = document.createElement('div');
        elHeader.className = 'flex items-center justify-between mb-8';

        // Back button and title container
        const elLeftSection = document.createElement('div');
        elLeftSection.className = 'flex items-center';

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
        elTitle.textContent = 'Time Wallets';

        elLeftSection.appendChild(elBackButton);
        elLeftSection.appendChild(elTitle);
        elHeader.appendChild(elLeftSection);

        return elHeader;
    }

    /**
     * Creates the add new wallet button
     * @private
     * @returns {HTMLElement} Button element for adding new time wallet
     */
    createAddButton() {
        const elAddButton = document.createElement('button');
        elAddButton.className = `
            w-full mb-6
            bg-purple-500 hover:bg-purple-600 
            text-white 
            py-3 px-4 
            rounded-lg
            flex items-center justify-center
            text-lg font-semibold
            transition-colors
        `;
        elAddButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Time Wallet
        `;
        elAddButton.addEventListener('click', () => {
            window.location.href = Constants.ROUTES.CHILDREN_CREATE;
        });

        return elAddButton;
    }

    /**
     * Creates the container with list of all children
     * @private
     * @returns {HTMLElement} Container element with children cards
     */
    createChildrenList() {
        const elListContainer = document.createElement('div');
        elListContainer.className = 'space-y-4';

        const arUsers = stateManager.getUsers();

        arUsers.forEach(obUser => {
            const elCard = this.createChildCard(obUser);
            elListContainer.appendChild(elCard);
        });

        return elListContainer;
    }

    /**
     * Creates a card displaying child's information and action buttons
     * @private
     * @param {User} obUser - User data to display in the card
     * @returns {HTMLElement} Card element with user information and actions
     */
    createChildCard(obUser) {
        const elCard = document.createElement('div');
        elCard.className = `
            bg-white 
            rounded-lg 
            shadow-md 
            p-4
            flex items-center justify-between
            transform transition-transform hover:scale-101
        `;

        // User info section
        const elInfo = this.createUserInfo(obUser);
        elCard.appendChild(elInfo);

        // Actions section
        const elActions = this.createActionButtons(obUser);
        elCard.appendChild(elActions);

        return elCard;
    }

    /**
     * Creates the user information section of the card
     * @private
     * @param {User} obUser - User whose information to display
     * @returns {HTMLElement} Container with user information
     */
    createUserInfo(obUser) {
        const elInfo = document.createElement('div');
        elInfo.className = 'flex-1';

        const elName = document.createElement('h3');
        elName.className = 'text-xl font-semibold';
        elName.textContent = obUser.sName;

        const elNickname = document.createElement('p');
        elNickname.className = 'text-gray-600';
        elNickname.textContent = obUser.sNickname;

        const elTimeBalance = document.createElement('p');
        elTimeBalance.className = 'text-green-600 font-medium';
        elTimeBalance.textContent = this.formatTime(obUser.nTimeBalance);

        elInfo.appendChild(elName);
        elInfo.appendChild(elNickname);
        elInfo.appendChild(elTimeBalance);

        return elInfo;
    }

    /**
     * Creates action buttons (edit/delete) for a user card
     * @private
     * @param {User} obUser - User for whom to create action buttons
     * @returns {HTMLElement} Container with action buttons
     */
    createActionButtons(obUser) {
        const elActions = document.createElement('div');
        elActions.className = 'flex gap-2';

        // Edit button
        const elEditButton = document.createElement('button');
        elEditButton.className = `
            p-2
            text-blue-600 hover:text-blue-800
            hover:bg-blue-50
            rounded-lg
            transition-colors
        `;
        elEditButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        `;
        elEditButton.addEventListener('click', () => {
            window.location.href = `${Constants.ROUTES.CHILDREN_EDIT}/${obUser.sId}`;
        });

        // Delete button (disabled for default user)
        if (obUser.sId !== Constants.DEFAULT_USER.sId) {
            const elDeleteButton = document.createElement('button');
            elDeleteButton.className = `
                p-2
                text-red-600 hover:text-red-800
                hover:bg-red-50
                rounded-lg
                transition-colors
            `;
            elDeleteButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            `;
            elDeleteButton.addEventListener('click', () => this.handleDelete(obUser));
            elActions.appendChild(elDeleteButton);
        }

        elActions.appendChild(elEditButton);
        return elActions;
    }

    /**
     * Handles the deletion of a user
     * Shows confirmation dialog and deletes if confirmed
     * @private
     * @param {User} obUser - User to delete
     * @returns {void}
     */
    handleDelete(obUser) {
        if (confirm(`Are you sure you want to delete ${obUser.sName}'s Time Wallet?`)) {
            stateManager.deleteUser(obUser.sId);
            this.render(); // Re-render the page
        }
    }

    /**
     * Formats time in seconds to a human-readable string
     * @private
     * @param {number} nSeconds - Time in seconds to format
     * @returns {string} Formatted time string (e.g., "2h 30m available")
     */
    formatTime(nSeconds) {
        const nHours = Math.floor(nSeconds / 3600);
        const nMinutes = Math.floor((nSeconds % 3600) / 60);
        return `${nHours}h ${nMinutes}m available`;
    }
}