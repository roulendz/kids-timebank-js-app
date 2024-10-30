/**
 * @file src/js/pages/BasePage.js
 * Base page class for common functionality
 */

import { Constants } from '../utils/Constants.js';

/**
 * Base page class for common functionality
 * @abstract
 */
export class BasePage {
    /**
     * Creates a new page instance
     */
    constructor() {
        // Flag to track initialization
        this._isInitialized = false;
    }

    /**
     * Initializes the page
     * Sets up the page environment and calls render
     * @protected
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this._isInitialized) {
            console.log('Page already initialized');
            return;
        }

        // Clear existing content
        this.clearContent();
        
        // Set background color
        document.body.style.backgroundColor = Constants.COLORS.BACKGROUND;

        this._isInitialized = true;
        console.log('Base page initialized');
    }

    /**
     * Clears all content from the body
     * @protected
     * @returns {void}
     */
    clearContent() {
        const content = document.getElementById('content');
        if (content) {
            content.innerHTML = '';
        } else {
            console.warn('Content element not found');
        }
    }

    /**
     * Renders page content
     * Must be implemented by child classes
     * @abstract
     * @protected
     * @returns {Promise<void>}
     * @throws {Error} If not implemented by child class
     */
    async render() {
        throw new Error('render() must be implemented');
    }

    /**
     * Refreshes the page content
     * Re-renders without full initialization
     * @protected
     * @returns {Promise<void>}
     */
    async refresh() {
        await this.render();
    }
}