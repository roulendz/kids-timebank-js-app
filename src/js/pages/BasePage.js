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
        this.initialize();
    }

    /**
     * Initializes the page
     * Sets up the page environment and calls render
     * @protected
     * @returns {void}
     */
    initialize() {
        // Clear existing content
        this.clearContent();
        
        // Set background color
        document.body.style.backgroundColor = Constants.COLORS.BACKGROUND;
        
        // Render new content
        this.render();
    }

    /**
     * Clears all content from the body
     * @protected
     * @returns {void}
     */
    clearContent() {
        document.body.innerHTML = '';
    }

    /**
     * Renders page content
     * Must be implemented by child classes
     * @abstract
     * @protected
     * @returns {void}
     * @throws {Error} If not implemented by child class
     */
    render() {
        throw new Error('render() must be implemented');
    }

    /**
     * Refreshes the page content
     * Clears existing content and re-renders
     * @protected
     * @returns {void}
     */
    refresh() {
        this.initialize();
    }
}