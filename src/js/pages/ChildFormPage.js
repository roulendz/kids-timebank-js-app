/**
 * @file src/js/pages/ChildFormPage.js
 * @typedef {import('../types/Types').User} User
 * @typedef {import('../types/Types').Schedule} Schedule
 */

import { BasePage } from './BasePage.js';
import { ChildForm } from '../components/ChildForm.js';
import { stateManager } from '../services/StateManager.js';
import { Constants } from '../utils/Constants.js';

/**
 * Page component for creating and editing child profiles
 * @extends BasePage
 */
export class ChildFormPage extends BasePage {
    /**
     * Creates an instance of ChildFormPage
     * @param {string|null} sUserId - User ID for editing, null for creating new user
     */
    constructor(sUserId) {
        super();
        this.sUserId = sUserId;
        this.obUser = sUserId ? stateManager.getUser(sUserId) : null;
    }

    /**
     * Initializes the ChildFormPage
     * @override
     * @returns {Promise<void>}
     */
    async initialize() {
        await super.initialize();
    }

    /**
     * Renders the child form page content
     * @override
     * @returns {Promise<void>}
     */
    async render() {
        try {
            // Clear existing content
            this.clearContent();

            const elContainer = document.createElement('div');
            elContainer.className = 'container mx-auto p-8';

            // Header with back button and title
            const elHeader = this.createHeader();
            elContainer.appendChild(elHeader);

            // Add user form
            const obChildForm = new ChildForm(
                this.handleFormSubmit.bind(this),
                this.obUser
            );

            elContainer.appendChild(obChildForm.element);

            // Append the container to the content element
            const contentElement = document.getElementById('content');
            contentElement.appendChild(elContainer);
        } catch (error) {
            console.error('Error rendering ChildFormPage:', error);
        }
    }

    /**
     * Creates the page header with back button
     * @private
     * @returns {HTMLElement} Header element with back button and title
     */
    createHeader() {
        const elHeader = document.createElement('div');
        elHeader.className = 'flex items-center mb-8';

        const elBackButton = this.createBackButton();
        const elTitle = this.createTitle();

        elHeader.appendChild(elBackButton);
        elHeader.appendChild(elTitle);

        return elHeader;
    }

    /**
     * Creates the back button element
     * @private
     * @returns {HTMLElement} Back button element
     */
    createBackButton() {
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
            window.location.href = Constants.ROUTES.CHILDREN;
        });

        return elBackButton;
    }

    /**
     * Creates the page title element
     * @private
     * @returns {HTMLElement} Title element
     */
    createTitle() {
        const elTitle = document.createElement('h1');
        elTitle.className = 'text-3xl font-bold';
        elTitle.textContent = this.obUser ? 'Edit Time Wallet' : 'New Time Wallet';
        return elTitle;
    }

    /**
     * Handles form submission for both create and update operations
     * @private
     * @param {Object} obData - Form data
     * @param {string} obData.sName - User's name
     * @param {string} obData.sNickname - User's nickname
     * @param {Schedule[]} obData.arSchedule - User's schedule
     * @param {string} [obData.sId] - User's ID (for updates)
     * @returns {void}
     */
    handleFormSubmit(obData) {
        if (this.sUserId) {
            // Update existing user
            stateManager.updateUser({
                ...obData,
                sId: this.sUserId
            });
        } else {
            // Add new user
            stateManager.addUser(obData.sName, obData.sNickname, obData.arSchedule);
        }
        window.location.href = Constants.ROUTES.CHILDREN;
    }
}