import { Constants } from '../utils/Constants.js';

/**
 * Base page class for common functionality
 */
export class BasePage {
    constructor() {
        this.initialize();
    }

    /**
     * Initialize the page
     * @protected
     */
    initialize() {
        document.body.style.backgroundColor = Constants.COLORS.BACKGROUND;
        document.body.innerHTML = ''; // Clear previous content
        this.render();
    }

    /**
     * Render page content
     * @protected
     */
    render() {
        // To be implemented by child classes
        throw new Error('render() must be implemented');
    }
}